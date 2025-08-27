
export interface AuthObject {
    username: string;
    chatHistory: string[];
}

export interface PromptObject {
    user_id: string;
    plaintext: string;
    code: string;
    language: Language
}

export type Language = "JavaScript" | "TypeScript" | "Python" | "Java" | "C#" | "C++" | "Go" | "Rust" | "Kotlin" | "Bash" | "SQL" | "JSON" | "Plaintext";

export interface MessagePart {
    text: string;
}

export interface MessageObject {
    role: "user" | "model";
    parts: MessagePart[];
}

export interface ChatHistoryResponse {
    messages: MessageObject[];
    // Add other response fields from your backend
}

export interface ChatResponse {
    // Structure based on llm_response.to_json_dict()
    text: string;
    usage_metadata?: {
        total_token_count: number;
        prompt_token_count: number;
        candidates_token_count: number;
    };
}