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
You will receive both text prompts and potential code to reference for your answers: if the code is not present, simply answer the text prompt to the best of your ability as if it's a general question that needs no context.
Never claim code is perfect. Help debug step-by-step. Format code in fenced blocks with the provided language. If a language is not directly stated, provide pseudocode instead and ask if the user would like you to explain it in detail for any specific language.
Use bullet lists when helpful. Avoid heavy formatting beyond standard Markdown. A response title, bullet list headers, bolded text for emphasis or important keywords, and code fencing should be the only formats used in 99 percent of cases, only breaking this pattern if asked specifically for examples of such.
Focus on provided code first; otherwise ask clarifying questions. Your responses should never be direct solutions to questions asked, but more concept-oriented, showing typical cases for how similar issues would be handled or guiding the user through debugging step by step.
When asked directly if you maintain previous conversations, in your own words reply with the sentiment "while that is not currently implemented, the potential is being looked into for a version 2 model that will do just that. At the moment, while only the last few messages are included for context in responses, when a session ends all relevant data is lost."
"""


class Chatbot:
    def __init__(self):
        self.users = defaultdict(lambda: User(chat_history=[], user_id=None))
        self.input_token_cost = 0.00001
        self.output_token_cost = 0.00003
        self.client = genai.Client()
        self.model = "gemini-2.5-flash"
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
        if now.day != daily_start_time.day or now.month != daily_start_time.month or now.year != daily_start_time.year:
            user.daily_requests = 0
            user.daily_start_time = time.time()
        return user.daily_requests < user.daily_quota

    def can_make_request(self, user_id):
        user = self.users[user_id]
        if user.user_id is None:
            user = User(chat_history=[], user_id=user_id)
            self.users[user_id] = user

        if not self._check_daily_quota(user):
            raise ValueError(f"User {user_id}: daily quota exceeded")

        self._refill_tokens(user)
        if user.current_tokens < 1:
            raise ValueError(f"User {user_id}: Rate limit exceeded. Please wait a moment and try again.")
        return True
        

    def make_llm_request(self, user_id, prompt, history):
        user = self.users[user_id]
        if self.can_make_request(user_id):
            user.daily_requests += 1
            # Ensure history is a list
            if not isinstance(history, list):
                history = []
            
            trimmed_history = self.trim_history(history, self.input_limit)
            joined_prompt = trimmed_history.copy()
            joined_prompt.append(prompt)
            
            # Ensure we have at least one message
            if not joined_prompt:
                joined_prompt = [prompt]
            try:
                prompt_tokens_response = self.client.models.count_tokens(model=self.model, contents=joined_prompt)
                prompt_tokens = prompt_tokens_response.total_tokens
                user.current_tokens -= prompt_tokens
                llm_response = self.client.models.generate_content(
                    model=self.model,
                    contents=joined_prompt,
                    config=self.config
                )
                user.current_tokens -= llm_response.usage_metadata.total_token_count
                
                # Add response to history
                joined_prompt.append({"role": "model", "parts": [{"text": llm_response.text}]})
                user.chat_history = joined_prompt
                
                # Return serializable response
                return {
                    "text": llm_response.text,
                    "usage_metadata": {
                        "total_token_count": llm_response.usage_metadata.total_token_count,
                        "prompt_token_count": llm_response.usage_metadata.prompt_token_count,
                        "candidates_token_count": llm_response.usage_metadata.candidates_token_count
                    }
                }
            except Exception as e:
                raise Exception(f"LLM API request failed: {str(e)}")

            
    
    def get_response_limits(self):
        model_info = self.client.models.get(model=self.model)
        return (model_info.input_token_limit, model_info.output_token_limit)
    
    def total_tokens(self, messages):
        if not messages:
            return 0
        response = self.client.models.count_tokens(model=self.model, contents=messages)
        return response.total_tokens
    
    def trim_history(self, messages, max_tokens):
        # Handle empty messages
        if not messages:
            return []
            
        # Keep system + as much recent history as fits
        system = [m for m in messages if m.get("role") == "system"][:1]
        rest = [m for m in messages if m.get("role") != "system"]
        kept = []
        
        # Handle empty system messages
        if system:
            current_tokens = self.total_tokens(system)
        else:
            current_tokens = 0
            
        for m in reversed(rest):
            try:
                message_tokens = self.total_tokens([m])
                if current_tokens + message_tokens <= max_tokens:
                    kept.append(m)
                    current_tokens += message_tokens
                else:
                    break
            except:
                # Skip malformed messages
                continue
        return system + list(reversed(kept))

