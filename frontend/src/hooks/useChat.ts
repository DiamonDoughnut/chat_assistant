import {useState} from 'react'
import type { Language, PromptObject, ChatResponse, MessageObject } from "../util/types";

interface ChatErrorResponse {
    error: string;
    message?: string;
}

export const useChat = () => {
    const [response, setResponse] = useState<ChatResponse | null>(null)
    const [promptError, setPromptError] = useState<unknown | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const codeBlockToMarkdown = (code: string, language: string) => {
        if (!code.trim()) return ""
        return `\`\`\`${language.toLowerCase()}\n${code}\n\`\`\``
    }

    const prep_and_send_prompt = async (promptObject: PromptObject): Promise<ChatResponse | null> => {
        try {
            setPromptError(null)
            setIsLoading(true)
            
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: promptObject.user_id,
                    user_text: promptObject.plaintext,
                    code: promptObject.code,
                    lang: promptObject.language.toLowerCase()
                })
            })

            const data = await response.json()

            if (!response.ok) {
                const errorData = data as ChatErrorResponse
                throw new Error(errorData.error || errorData.message || 'Chat request failed')
            }

            const chatResponse = data as ChatResponse
            setResponse(chatResponse)
            return chatResponse
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Chat request failed'
            setPromptError(errorMessage)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const build_prompt_object = (user_id: string, plaintext: string, code_plaintext: string, language: Language): PromptObject => {
        const formattedCode = code_plaintext.trim() ? codeBlockToMarkdown(code_plaintext, language) : ""
        return {
            user_id,
            plaintext,
            code: formattedCode,
            language
        }
    }

    const build_user_message = (plaintext: string, code: string): MessageObject => {
        const content = code ? `${plaintext}\n\n${code}` : plaintext
        return {
            role: "user",
            parts: [{ text: content }]
        }
    }

    const build_model_message = (response: ChatResponse): MessageObject => {
        return {
            role: "model",
            parts: [{ text: response.text }]
        }
    }

    const handlePromptError = (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setPromptError(errorMessage)
        return errorMessage
    }

    return {
        response,
        prep_and_send_prompt,
        build_prompt_object,
        build_user_message,
        build_model_message,
        promptError,
        handlePromptError,
        isLoading
    }
}