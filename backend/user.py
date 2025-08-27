import time

class User:
    def __init__(self, chat_history, refill_rate=1.0, bucket_capacity=10000, user_id = None, daily_quota=125):
        self.user_id = user_id
        self.bucket_capacity = bucket_capacity
        self.refill_rate = refill_rate
        self.daily_quota = daily_quota
        self.chat_history = chat_history
        self.is_admin = False
        self.created_at = time.time()

        self.current_tokens = bucket_capacity
        self.last_refill = time.time()

        self.daily_requests = 0
        self.daily_start_time = time.time()

    def promote_user(self, user):
        if self.is_admin and self.user_id != user.user_id:
            user.is_admin = True

    def demote_user(self, user):
        if self.user_id != user.user_id and self.is_admin:
            user.is_admin = False

    def login(self, user_object):
        logged_in = User(user_id=user_object["_id"], chat_history=user_object.get("chat_history", []))
        logged_in.is_admin = user_object.get("admin", False)
        logged_in.created_at = user_object.get("created_at", time.time())
        return logged_in

    def get_user_data(self):
        data_structure = {
            "_id": self.user_id,
            "chat_history": self.chat_history,
            "admin": self.is_admin,
            "created_at": self.created_at,
            "last_updated": time.time()
        }
        return data_structure
