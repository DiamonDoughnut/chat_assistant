from collections import defaultdict
import time
from datetime import datetime, timedelta
from user import User
from google import genai
from google.genai import types

RATE_LIMIT_SECONDS = 60
MAX_REQUESTS_PER_USER = 5

SYSTEM_PROMPT = """
You are a concise coding instructor. Be brief and affable. Use 1–2 Socratic questions before hints. 
Never claim code is perfect. Help debug step-by-step. Format code in fenced blocks with the provided language. 
Use bullet lists when helpful. Avoid heavy formatting beyond standard Markdown. 
Focus on provided code first; otherwise ask clarifying questions.
"""


class Chatbot:
    def __init__(self):
        self.users = defaultdict(lambda: User(user_id=None))
        self.input_token_cost = 0.00001
        self.output_token_cost = 0.00003
        self.client = genai.Client()
        self.model = "gemini-2.5-flash-001"
        self.input_limit, self.output_limit = self.get_response_limits()
        self.minute_tokens = 250000
        self.minute_requests = 10
        self.daily_requests = 250
        self.config = types.GenerateContentConfig(temperature=0.2, system_instruction=SYSTEM_PROMPT)

    def _refill_tokens(self, user):
        now = time.time()
        elapsed_time = now - user.last_refill
        refill_amount = elapsed_time * user.refill_rate
        user.current_tokens = min(user.bucket_capacity, user.current_tokens + refill_amount)
        user.last_refill = now

    def _check_daily_quota(self, user):
        now = datetime.now()
        daily_start_time = datetime.fromtimestamp(user.daily_start_time)
        if now.month != daily_start_time.month or now.year != daily_start_time.year:
            user.daily_requests = 0
            user.daily_start_time = time.time()
        return user.daily_requests < user.daily_quota

    def can_make_request(self, user_id):
        user = self.users[user_id]
        if user.user_id is None:
            user = User(user_id)
            self.users[user_id] = user

        if not self._check_daily_quota(user):
            raise Exception(f"User {user_id}: daily quota exceeded")

        self._refill_tokens(user_id)
        user = self.users[user_id]
        if user.current_tokens >= 1:
            return True
        else:
            raise Exception(f"User {user_id}: Rate limit exceeded. Please wait a moment and try again.")

    def make_llm_request(self, user_id, prompt, history):
        user = self.users[user_id]
        if self.can_make_request(user_id):
            user.daily_requests += 1
            trimmed_history = self.trim_history(history)
            joined_prompt = trimmed_history
            joined_prompt.append(prompt)
            prompt_tokens = self.client.models.count_tokens(joined_prompt)
            user.current_tokens -= prompt_tokens
            llm_response = self.client.models.generate_content(
                model=self.model,
                contents=joined_prompt,
                config=self.config
            )
            user.current_tokens -= llm_response.usage_metadata.total_token_count
            joined_prompt.append({"agent": llm_response.text})
            user.chat_history = joined_prompt
            return llm_response.to_json_dict()

            
    
    def get_response_limits(self):
        model_info = self.client.models.get(model=self.model)
        return (model_info.input_token_limit, model_info.output_token_limit)
    
    def total_tokens(self, messages):
        return self.client.models.count_tokens(model=self.model, contents=messages)
    
    def trim_history(self, messages, max_tokens):
        # Keep system + as much recent history as fits
        system = [m for m in messages if m["role"] == "system"][:1]
        rest = [m for m in messages if m["role"] != "system"]
        kept = []
        for m in reversed(rest):
            if m <= 5:
                kept.append(m)
            else:
                break
        return system + list(reversed(kept))

