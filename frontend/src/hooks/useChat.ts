import {useState} from 'react'
import type { Language, PromptObject } from "../util/types";

export const useChat = () => {
    const [response, setResponse] = useState<string>();
    const [promptError, setPromptError] = useState<unknown | null>(null)

    const codeBlockToMarkdown = (code: string) => {
        const markdownCode = "```\n" + code + "\n```";
        return markdownCode
    }

    const prep_and_send_prompt = (promptObject: PromptObject) => {
        return "promptObject sent"
    }

    const build_prompt_object = (user_id: string, plaintext: string, code_plaintext: string, language: Language) => {
        const code: string = codeBlockToMarkdown(code_plaintext)
        return {user_id, plaintext, code, language}
    }

    const handlePromptError = (error: unknown) => {
        setPromptError(error)
        return error;
    }

    return [
        response,
        prep_and_send_prompt,
        build_prompt_object,
        promptError,
        handlePromptError
    ]
}