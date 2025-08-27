import {useState, useEffect} from 'react'
import type { AuthObject } from '../util/types'

interface LoginResponse {
    token: string;
    user_id: string;
    username: string;
}

interface ErrorResponse {
    error: string;
}

export interface AuthData {
 user_data: AuthObject | null;
 isAuthorized: boolean;
 authError: unknown | null;
 login: (username: string, password: string) => Promise<void>;
 register: (username: string, password: string) => Promise<void>;
 logout: () => void;
}

export const useAuth = (): AuthData => {
    const [user_data, setUser_data] = useState<AuthObject | null>(null)
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
    const [authError, setAuthError] = useState<unknown|null>(null)

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user_data')
        if (token && userData) {
            setUser_data(JSON.parse(userData))
            setIsAuthorized(true)
        }
    }, [])

    const login = async (username: string, password: string): Promise<void> => {
        try {
            setAuthError(null)
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (!response.ok) {
                const errorData = data as ErrorResponse
                throw new Error(errorData.error || 'Login failed')
            }

            const loginData = data as LoginResponse
            
            // Store token and user data
            localStorage.setItem('token', loginData.token)
            const authObject: AuthObject = {
                username: loginData.username,
                chatHistory: []
            }
            localStorage.setItem('user_data', JSON.stringify(authObject))
            
            setUser_data(authObject)
            setIsAuthorized(true)
        } catch (error) {
            setAuthError(error instanceof Error ? error.message : 'Login failed')
            throw error
        }
    }

    const register = async (username: string, password: string): Promise<void> => {
        try {
            setAuthError(null)
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (!response.ok) {
                const errorData = data as ErrorResponse
                throw new Error(errorData.error || 'Registration failed')
            }

            // Auto-login after successful registration
            await login(username, password)
        } catch (error) {
            setAuthError(error instanceof Error ? error.message : 'Registration failed')
            throw error
        }
    }

    const logout = (): void => {
        localStorage.removeItem('token')
        localStorage.removeItem('user_data')
        setUser_data(null)
        setIsAuthorized(false)
        setAuthError(null)
    }

    return {
        user_data,
        isAuthorized,
        authError,
        login,
        register,
        logout,
    }
}