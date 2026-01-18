from google import genai
from dotenv import load_dotenv
import asyncio
import simpleaudio as sa
import numpy as np
import os

load_dotenv()
API_KEY = os.getenv("API_KEY")
AUDIO_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"
TRANSCRIPTION_MODEL = ""

SYSTEM_INSTRUCTIONS = """You are a budget manager, and your job is to record when and what the user spent money on.
"""

TOOLS = [{
    "function_declarations": [
        {
            "name": "add_to_database",
            "description": "Adds an entry of spending or income to the user's personal database",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {"type": "number"},
                    "category": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["amount", "category"]
            }
        }
    ]
}]

AUDIO_CONFIG = {
    "tools": TOOLS,
    "response_modalities": ["AUDIO"],
    "output_audio_transcription": {},
    "system_instruction": SYSTEM_INSTRUCTIONS,
}


class LLMCaller:
    def __init__(self, api_key, model):
        self.api_key = api_key
        self.model = model
        self.client = genai.Client(api_key=API_KEY)
        self.tools = {"add_to_database": self.add_to_database}

    def call_text(self, text):
        response = self.client.models.generate_content(
            model=self.model,
            contents=text
        )

        return response

    def call_audio(self):
        audio_session = AudioSession(self.client, self.tools)
        try:
            asyncio.run(audio_session.activate())
        except InterruptedError:
            print("Interrupted")

    def add_to_database(self, amount, category, description=None):
        # Implement adding to database
        print(f"Adding to database: amount={amount}, category={category}, description={description}")
        return {"status": "success", "message": "Entry added successfully"}


class AudioSession:
    def __init__(self, client, tools):
        self.config = AUDIO_CONFIG
        self.audio_model = AUDIO_MODEL
        self.transcription_model = TRANSCRIPTION_MODEL
        self.client = client
        self.closed = False
        self.audio_mic_queue = asyncio.Queue()
        self.audio_output_queue = asyncio.Queue()
        self.tools = tools
        self.live_session = None

    async def recieve_audio(self, audio):
        # audio should be in 16-bit PCM format
        await self.audio_mic_queue.put({
            "data": audio,
            "mime_type": "audio/pcm"}
        )

    async def send_realtime(self, session):
        while True:
            msg = await self.audio_mic_queue.get()
            print(f"Sending audio chunk of {len(msg['data'])} bytes")
            await session.send_realtime_input(audio=msg)

    async def recieve_llm_response(self, session):
        while True:
            turn = session.receive()
            async for response in turn:
                if response.tool_call is not None:
                    print("Recieved tool call")
                    await self.handle_tool_call(session, response.tool_call.function_calls) # noqa E501
                if (response.server_content and response.server_content.model_turn): # noqa E501
                    for part in response.server_content.model_turn.parts:
                        if part.text:
                            print(f"Received text: {part.text}")
                        if part.inline_data and isinstance(part.inline_data.data, bytes): # noqa E501
                            print(f"Received audio chunk of {len(part.inline_data.data)} bytes")
                            self.audio_output_queue.put_nowait(part.inline_data.data) # noqa E501

            # Empty the queue on interruption to stop playback
            # while not self.audio_output_queue.empty():
            #     self.audio_output_queue.get_nowait()

    async def send_response(self):
        while True:
            audio_data = await self.audio_output_queue.get()
            if audio_data:
                # Assuming 16-bit PCM, mono, 24kHz (as per docs)
                sample_rate = 24000
                audio_array = np.frombuffer(audio_data, dtype=np.int16)
                def play_audio():
                    play_obj = sa.play_buffer(audio_array, 1, 2, sample_rate)
                    play_obj.wait_done()
                await asyncio.get_event_loop().run_in_executor(None, play_audio)

    async def handle_tool_call(self, session, function_calls):
        for call in function_calls:
            print(f"Gemini requested: {call.name} with args: {call.args}")
            try:
                result = self.tools[call.name](**call.args)
            except KeyError:
                print("Function does not exist")
                result = "Function does not exist"

            # 3. Send the result back to the model
            # The 'id' must match the 'id' from the tool_call
            await session.send_tool_response(function_responses=[{
                "name": call.name,
                "response": result,
                "id": call.id
            }])
            print("Response sent back to Gemini.")

    async def activate(self):
        try:
            async with self.client.aio.live.connect(
                model=AUDIO_MODEL, config=self.config
            ) as live_session:
                self.live_session = live_session
                print("Connected")
                # Test with text input to verify Live API works
                await live_session.send_client_content(turns={"parts": [{"text": "I just spent $50 on groceries"}]})
                async with asyncio.TaskGroup() as tg:
                    tg.create_task(self.recieve_llm_response(live_session))
                    tg.create_task(self.send_response())
        except asyncio.CancelledError:
            pass
        finally:
            print("\nConnection closed.")
