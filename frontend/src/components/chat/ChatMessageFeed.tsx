import type { MessageObject } from '@/util/types'
import React from 'react'
import ChatMessage from './ChatMessage';

const ChatMessageFeed = ({chatHistory}: {chatHistory: MessageObject[]}) => {
    if (chatHistory.length < 1) return null;
  return (
    <div className='h-3/4 w-full bg-slate-800 text-gray-200 overflow-y-auto p-4'>
        {chatHistory.map((message: MessageObject, index: number) => 
            <ChatMessage key={index} message={message} />
        )}
    </div>
  )
}

export default ChatMessageFeed