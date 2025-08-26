from flask import Flask, request, jsonify
import os, time, uuid
import webview
import threading

app = Flask(__name__)

# Simple in-memory store: {session_id: [messages]}
SESSIONS = {}

# Model configs
PROVIDERS = [
    {
        "name": "openai",
        "model": "gpt-4o-mini",
        "ctx_tokens": 128000,
        "temperature": 0.2,
    },
    # Add more providers/models here with their ctx limits
]

SYSTEM_PROMPT = """
You are a concise coding instructor. Be brief and affable. Use 1–2 Socratic questions before hints. 
Never claim code is perfect. Help debug step-by-step. Format code in fenced blocks with the provided language. 
Use bullet lists when helpful. Avoid heavy formatting beyond standard Markdown. 
Focus on provided code first; otherwise ask clarifying questions."""

def est_tokens(text: str) -> int:
    # naive estimate ~4 chars per token
    return max(1, len(text) // 4)

def total_tokens(messages):
    return sum(est_tokens(m["content"]) for m in messages)

def trim_history(messages, max_tokens):
    # Keep system + as much recent history as fits
    system = [m for m in messages if m["role"] == "system"][:1]
    rest = [m for m in messages if m["role"] != "system"]
    kept = []
    for m in reversed(rest):
        if total_tokens(system + list(reversed(kept)) + [m]) <= max_tokens:
            kept.append(m)
        else:
            break
    return system + list(reversed(kept))

def build_user_content(user_text, code, lang):
    parts = []
    if user_text:
        parts.append(user_text.strip())
    if code:
        parts.append(f"```{lang or ''}\n{code.strip()}\n```")
    return "\n\n".join(parts).strip()

def call_openai(messages, model, temperature):
    import openai
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    resp = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )
    content = resp["choices"][0]["message"]["content"]
    usage = resp.get("usage", {})
    return content, usage

def call_provider(provider, messages):
    name = provider["name"]
    if name == "openai":
        return call_openai(messages, provider["model"], provider["temperature"])
    raise RuntimeError(f"Unknown provider {name}")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    session_id = data.get("session_id") or str(uuid.uuid4())
    user_text = data.get("user_text", "")
    code = data.get("code", "")
    lang = data.get("lang", "plaintext")
    settings = data.get("settings", {}) or {}
    max_resp = int(settings.get("max_response_tokens", 800))

    # Enforce code size cap
    if code:
        if code.count("\n") + 1 > 150:
            return jsonify({
                "error": "code_too_large",
                "message": "Please paste a smaller snippet (<= 150 lines) or share a repro gist.",
                "session_id": session_id
            }), 400

    # Initialize session
    history = SESSIONS.get(session_id, [])
    if not history:
        history = [{"role": "system", "content": SYSTEM_PROMPT}]
    # Build user turn
    user_content = build_user_content(user_text, code, lang)
    history.append({"role": "user", "content": user_content})

    last_error = None
    # Try providers in order
    for p in PROVIDERS:
        ctx_limit = p["ctx_tokens"]
        # Conservative budget: leave room for response
        budget = max(1000, ctx_limit - max_resp - 1000)
        trimmed = trim_history(history, budget)
        try:
            content, usage = call_provider(p, trimmed)
            # Save assistant reply
            history.append({"role": "assistant", "content": content})
            # Cap history size in memory (optional)
            if len(history) > 50:
                history = trim_history(history, 20000)
            SESSIONS[session_id] = history
            return jsonify({
                "assistant_markdown": content,
                "usage": usage,
                "provider": p["name"],
                "model": p["model"],
                "session_id": session_id
            })
        except Exception as e:
            last_error = str(e)
            # On certain errors, continue; otherwise break
            time.sleep(0.2)
            continue

    return jsonify({
        "error": "all_providers_failed",
        "message": "All providers failed. Try again shortly.",
        "details": last_error,
        "session_id": session_id
    }), 502

def start_flask():
    app.run(debug=True)

if __name__ == "__main__":
    t = threading.Thread(target=start_flask)
    t.daemon = True
    t.start()

    webview.create_window("Coding Assistant", 'http://localhost:5000')
    webview.start()