"use client"
import React, {useState, useEffect} from 'react'

import './App.css'
import { useAuth } from './hooks/useAuth'
import { useChat } from './hooks/useChat'

function App() {
  const [username, setUsername] = useState<string>()
  const [chatHistory, setChatHistory] = useState<string[]>()
  const [currentMessage, setCurrentMessage] = useState<string>()
  const [currentCode, setCurrentCode] = useState<string>()
  const [currentLang, setCurrentLang] = useState<"python" | "javascript" | "typescript" | "go" | "java" | "shell" | undefined>()
  const [error, setError] = useState<Error | undefined>()

  const [response, prep_and_send_prompt, build_prompt_object, promptError, handlePromptError] = useChat()
  const [user_data, isAuthorized, authError, login, logout, register, handleAuthError] = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-4">Chat Assistant</h1>
        <p className="text-xl">
          Your coding assistant is ready to help!
        </p>
      </header>
    </div>
  );
}

export default App;