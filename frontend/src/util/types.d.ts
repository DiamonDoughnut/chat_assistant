
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