from google import genai
from google.genai import types
from dotenv import load_dotenv
import asyncio
import simpleaudio as sa
import numpy as np
import os
import time

load_dotenv()
API_KEY = os.getenv("API_KEY")

TEXT_MODEL = "gemini-3-flash-preview"
AUDIO_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"

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
        self.model = TEXT_MODEL
        self.client = genai.Client(api_key=API_KEY)
        self.tools = {"add_to_database": self.add_to_database}
        self.audio_session = AudioSession(self.client, self.tools)

    def call_text(self, text):
        response = self.client.models.generate_content(
            model=self.model,
            contents=text
        )

        return response

    async def call_audio(self):
        try:
            await self.audio_session.activate()
        except InterruptedError:
            print("Interrupted")

    def add_to_database(self, amount, category, description=None):
        # Implement adding to database, and also other functions wherever needed
        print(f"Adding to database: amount={amount}, category={category}, description={description}")
        return {"status": "success", "message": "Entry added successfully"}


class AudioSession:
    def __init__(self, client, tools):
        self.config = AUDIO_CONFIG
        self.audio_model = AUDIO_MODEL
        self.client = client
        self.closed = False
        self.audio_mic_queue = asyncio.Queue(maxsize=5)
        self.audio_output_queue = asyncio.Queue()
        self.tools = tools
        self.live_session = None
        self.chunks = None
        self.stop_event = asyncio.Event()

    async def recieve_audio(self, audio):
        # audio should be in 16-bit PCM format
        await self.audio_mic_queue.put({
            "data": audio,
            "mime_type": "audio/pcm;rate=16000"}
        )

    async def send_realtime(self, session):
        while True:
            msg = await self.audio_mic_queue.get()
            if len(msg['data']) > 100:
                print(f"Sending audio chunk of {len(msg['data'])} bytes")
            await session.send_realtime_input(audio=msg)

    async def feed_audio(self):
        """Feed pre-recorded audio chunks in real-time fashion, then loop."""
        if self.chunks:
            for chunk in self.chunks:
                await self.recieve_audio(chunk)
                await asyncio.sleep(0.1)  # Simulate real-time delay
            silence = b'\x00\x00' * 10000  # Silence chunk to indicate end
            await self.recieve_audio(silence)

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
                if (response.server_content and response.server_content.output_transcription):
                    print("Transcript:", response.server_content.output_transcription.text)

            # Empty the queue on interruption to stop playback
            # while not self.audio_output_queue.empty():
            #     self.audio_output_queue.get_nowait()

    async def send_response(self):
        """
        Will be a function to send responses back to the user.
        Currently it just plays audio responses from Gemini.
        AI wrote this function. 
        """
        while not self.stop_event.is_set():
            try:
                audio_data = await asyncio.wait_for(self.audio_output_queue.get(), timeout=0.5)
                if audio_data:
                    # Assuming 16-bit PCM, mono, 24kHz (as per docs)
                    sample_rate = 24000
                    audio_array = np.frombuffer(audio_data, dtype=np.int16)
                    def play_audio():
                        play_obj = sa.play_buffer(audio_array, 1, 2, sample_rate)
                        play_obj.wait_done()
                    await asyncio.get_event_loop().run_in_executor(None, play_audio)
            except asyncio.TimeoutError:
                continue

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
                async with asyncio.TaskGroup() as tg:
                    tg.create_task(self.send_realtime(live_session))
                    tg.create_task(self.recieve_llm_response(live_session))
                    tg.create_task(self.send_response())
                    if self.chunks:
                        tg.create_task(self.feed_audio())
        except asyncio.CancelledError:
            pass
        finally:
            self.stop_event.set()
            print("\nConnection closed.")
