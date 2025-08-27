"use client"
import React, {useState, useEffect} from 'react'

import './App.css'
import { useAuth } from './hooks/useAuth'
import { useChat } from './hooks/useChat'
import AuthDialog from './components/AuthDialog'
import Chat from './components/Chat'
import ChatInput from './components/chat/ChatInput'
import type { MessageObject } from './util/types'

function App() {
  const [chatMessages, setChatMessages] = useState<MessageObject[]>([])
  const [currentMessage, setCurrentMessage] = useState<string>("")
  const [currentCode, setCurrentCode] = useState<string>("")
  const [currentLang, setCurrentLang] = useState<string>("Plaintext")

  const {response, prep_and_send_prompt, build_prompt_object, build_user_message, build_model_message, promptError, handlePromptError, isLoading} = useChat()
  const {user_data, isAuthorized, authError, login, logout, register} = useAuth()

  // Handle chat responses and errors
  useEffect(() => {
    if (response) {
      const modelMessage = build_model_message(response)
      setChatMessages(prev => [...prev, modelMessage])
    } else if (promptError) {
      console.error('Chat error:', promptError)
      const errorMessage: MessageObject = {
        role: "model",
        parts: [{ text: `Error: ${promptError}` }]
      }
      setChatMessages(prev => [...prev, errorMessage])
    }
  }, [response, promptError])

  const handleSubmit = async () => {
    if (!currentMessage.trim() || !user_data || isLoading) return

    try {
      const userMessage = build_user_message(currentMessage, currentCode || "")
      setChatMessages(prev => [...prev, userMessage])

      const promptObject = build_prompt_object(
        user_data.username,
        currentMessage,
        currentCode,
        currentLang as any
      )

      await prep_and_send_prompt(promptObject)

      setCurrentMessage("")
      setCurrentCode("")
    } catch (error) {
      handlePromptError(error)
    }
  }

  console.log('Render state:', { isAuthorized, chatMessagesLength: chatMessages.length, isLoading })

  // Show auth dialog when not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <AuthDialog 
          login={login} 
          register={register} 
          authError={authError} 
          open={true}
        />
      </div>
    )
  }

  // Show welcome screen with input when authorized but no messages
  if (isAuthorized && chatMessages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Chat Assistant</h1>
            <p className="text-xl">
              Your coding assistant is ready to help!
            </p>
          </header>
        </div>
        <ChatInput 
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          currentCode={currentCode}
          setCurrentCode={setCurrentCode}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
          handleSubmit={handleSubmit}
        />
      </div>
    )
  }

  // Show full chat when messages exist
  if (isAuthorized && chatMessages.length > 0) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Chat 
          chatMessages={chatMessages}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          currentCode={currentCode}
          setCurrentCode={setCurrentCode}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
          handleSubmit={handleSubmit}
        />
      </div>
    )
  }

  // Fallback - should never reach here
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}

export default App;