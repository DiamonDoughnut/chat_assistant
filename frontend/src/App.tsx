"use client"
import logo from './logo.svg';
import './App.css';
import React, {useState, useEffect} from 'react'

function App() {
  const [username, setUsername] = useState<string>()
  const [chatHistory, setChatHistory] = useState<string[]>()
  const [currentMessage, setCurrentMessage] = useState<string>()
  const [currentCode, setCurrentCode] = useState<string>()
  const [currentLang, setCurrentLang] = useState<"python" | "javascript" | "typescript" | "go" | "java" | "shell" | undefined>()
  const [error, setError] = useState<Error | undefined>()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <header className="text-center">
        <img src={logo} className="h-40 mx-auto animate-spin" alt="logo" />
        <p className="text-xl mt-4">
          Edit <code className="bg-gray-800 px-2 py-1 rounded">src/App.js</code> and save to reload.
        </p>
        <a
          className="text-blue-400 hover:text-blue-300 mt-4 inline-block"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
