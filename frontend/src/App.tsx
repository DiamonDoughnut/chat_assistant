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
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
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
