from google import genai
import asyncio

API_KEY = "AIzaSyAKt47OUwz3Yns08ncxBfOVy78FZVKEJhU"
MODEL = "gemini-3-flash-preview"

SYSTEM_INSTRUCTIONS = "Be smart."

AUDIO_CONFIG = {
    "response_modalities": ["AUDIO"],
    "system_instruction": SYSTEM_INSTRUCTIONS,
}


class LLMCaller:
    def __init__(self, api_key, model):
        self.api_key = api_key
        self.model = model
        self.client = genai.Client(api_key=API_KEY)

    def call_text(self, text):
        response = self.client.models.generate_content(
            model=self.model,
            contents=text
        )

        return response

    def call_audio(self):
        audio_session = AudioSession(self.client)
        try:
            asyncio.run(audio_session.activate())
        except InterruptedError:
            print("Interrupted")


class AudioSession:
    async def __init__(self, client):
        self.config = AUDIO_CONFIG
        self.client = client
        self.closed = False
        self.audio_mic_queue = asyncio.Queue()
        self.audio_output_queue = asyncio.Queue()

    async def recieve_audio(self, audio):
        # audio should be in 16-bit PCM format
        await self.audio_mic_queue.put({
            "data": audio,
            "mime_type": "audio/pcm"}
        )

    async def send_realtime(self, session):
        while True:
            msg = await self.audio_mic_queue.get()
            await session.send_realtime_input(audio=msg)

    async def recieve_llm_response(self, session):
        while True:
            turn = session.receive()
            async for response in turn:
                if (response.server_content and response.server_content.model_turn):
                    for part in response.server_content.model_turn.parts:
                        if part.inline_data and isinstance(part.inline_data.data, bytes):
                            self.audio_output_queue.put_nowait(part.inline_data.data)

            # Empty the queue on interruption to stop playback
            while not self.audio_output_queue.empty():
                self.audio_output_queue.get_nowait()

    async def send_response(self, ):
        # Function to send the response back to the client
        pass

    async def activate(self):
        try:
            async with self.client.aio.live.connect(
                model=MODEL, config=self.config
            ) as live_session:
                print("Connected")
                async with asyncio.TaskGroup() as tg:
                    tg.create_task(self.send_realtime(live_session))
                    tg.create_task(self.recieve_llm_response(live_session))
                    tg.create_task(self.send_response())
        except asyncio.CancelledError:
            pass
        finally:
            print("\nConnection closed.")
