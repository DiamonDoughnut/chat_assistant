import type { MessageObject } from '@/util/types'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


const ChatMessage = ({message}: {message: MessageObject}) => {
    const role = message.role
    const parts = message.parts
    let messageFormat = "w-full h-fit flex items-start py-2 "
    let messageText = ""
    let messagePresent = false
    if (parts.length > 0){
        messagePresent = true
        messageText = parts[0].text
    }
    if (role === "user") messageFormat += "justify-start"
    else if (role === "model") messageFormat += "justify-end"
    
    const bubbleStyle = role === "user" 
        ? "bg-blue-600 text-white" 
        : "bg-slate-700 text-gray-100"
    
    if (messagePresent) {
        return (
            <div className={messageFormat}>
                <div className={`w-fit max-w-[80%] rounded-2xl px-4 py-3 ${bubbleStyle}`}>
                    <ReactMarkdown
                        className="prose prose-sm max-w-none prose-invert"
                        components={{
                            code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={oneDark as any}
                                        language={match[1]}
                                        PreTag="div"
                                        className="rounded-md my-2"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className="bg-slate-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-2">{children}</ol>
                        }}
                    >
                        {messageText}
                    </ReactMarkdown>
                </div>
            </div>
        )
    }
    return (null)
}

export default ChatMessage