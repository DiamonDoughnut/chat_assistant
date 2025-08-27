import React, { type Dispatch, type SetStateAction } from 'react'
import ChatMessageFeed from './chat/ChatMessageFeed';
import ChatInput from './chat/ChatInput';
import type { MessageObject } from '../util/types';

interface ChatProps {
    chatMessages: MessageObject[];
    currentMessage: string;
    setCurrentMessage: Dispatch<SetStateAction<string>>
    currentCode: string;
    setCurrentCode: Dispatch<SetStateAction<string>>
    currentLang: string;
    setCurrentLang: Dispatch<SetStateAction<string>>
    handleSubmit: () => void
    
}

const Chat = ({chatMessages, setCurrentCode, setCurrentLang, setCurrentMessage, handleSubmit, currentCode, currentLang, currentMessage}: ChatProps) => {
  return (
    <div className='h-full w-full bg-slate-800 text-gray-200 flex flex-col'>
        <ChatMessageFeed chatHistory={chatMessages} />
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

export default Chat