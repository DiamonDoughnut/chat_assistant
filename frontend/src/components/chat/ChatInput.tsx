import React, { useState, type Dispatch, type SetStateAction } from 'react'
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, Code } from 'lucide-react';

export interface ChatInputProps {
    currentMessage: string
    setCurrentMessage: Dispatch<SetStateAction<string>>
    currentCode: string
    setCurrentCode: Dispatch<SetStateAction<string>>
    currentLang: string
    setCurrentLang: Dispatch<SetStateAction<string>>
    handleSubmit: () => void
}

const ChatInput = ({currentCode, currentLang, currentMessage, setCurrentCode, setCurrentLang, setCurrentMessage, handleSubmit}: ChatInputProps) => {

    const [codeOpen, setCodeOpen] = useState<boolean>(false)

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    }

  return (
    <div className='w-full bg-slate-900 border-t border-slate-700 p-4 space-y-4'>
        <div className='space-y-2'>
            <Label htmlFor='message-input'>Message</Label>
            <Textarea 
                id='message-input'
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask a question or describe your problem..."
                className="min-h-[100px] resize-none bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                onKeyDown={handleKeyDown}
            />
        </div>

        <Collapsible open={codeOpen} onOpenChange={setCodeOpen}>
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                    <Code className="h-4 w-4" />
                    Add Code for Context
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${codeOpen ? 'rotate-180' : ''}`} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
                <div className='flex items-center gap-2'>
                    <Label htmlFor='lang-select' className='text-sm'>Language:</Label>
                    <Select onValueChange={setCurrentLang} defaultValue="Plaintext">
                        <SelectTrigger className='w-[200px] bg-slate-800 border-slate-600 text-white'>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className='bg-slate-800 border-slate-600'>
                            <SelectItem value="JavaScript">JavaScript</SelectItem>
                            <SelectItem value="TypeScript">TypeScript</SelectItem>
                            <SelectItem value="Python">Python</SelectItem>
                            <SelectItem value="Java">Java</SelectItem>
                            <SelectItem value="C#">C#</SelectItem>
                            <SelectItem value="C++">C++</SelectItem>
                            <SelectItem value="Go">Go</SelectItem>
                            <SelectItem value="Rust">Rust</SelectItem>
                            <SelectItem value="Kotlin">Kotlin</SelectItem>
                            <SelectItem value="Bash">Bash</SelectItem>
                            <SelectItem value="SQL">SQL</SelectItem>
                            <SelectItem value="JSON">JSON</SelectItem>
                            <SelectItem value="Plaintext">Plaintext</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className='space-y-2'>
                    <Label htmlFor='code-input'>Code</Label>
                    <Textarea 
                        id='code-input'
                        value={currentCode}
                        onChange={(e) => setCurrentCode(e.target.value)}
                        placeholder="Paste your code here..."
                        className="min-h-[150px] resize-none bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 font-mono text-sm"
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>

        <div className='flex justify-end'>
            <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={!currentMessage.trim()}
            >
                Send
            </Button>
        </div>
    </div>
  )
}

export default ChatInput