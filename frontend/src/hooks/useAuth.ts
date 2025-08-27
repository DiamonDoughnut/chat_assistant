import {useState} from 'react'
import type { AuthObject } from '../util/types'

export const useAuth = () => {
    const [user_data, setUser_data] = useState<AuthObject | null>(null)
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false)
    const [authError, setAuthError] = useState<unknown|null>(null)

    const login = (username: string, password: string) => {
        const method = "GET"
        return "Auth.Login.clicked"
    }

    const register = (username: string, password: string) => {
        const method = "POST"
        return "Auth.Register.clicked"
    }

    const logout = (username: string) => {
        const method = "POST"
        return "Auth.Logout.clicked"
    }

    const handleAuthError = (error: string) => {
        return "Auth.Error"
    }

    return [
        user_data,
        isAuthorized,
        authError,
        login,
        logout,
        register,
        handleAuthError
    ]
}