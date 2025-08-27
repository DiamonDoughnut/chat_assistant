import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface AuthDialogProps {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  authError: unknown;
  open: boolean
}


const AuthDialog = ({login, register, authError, open}: AuthDialogProps) => {

  const [form, setForm] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const passwordsMatch = password === confirmPassword && password.length > 0
  const isFormValid = username.trim().length > 0 && password.length > 0 && 
    (form === 'login' || passwordsMatch)
  
  const handleLogin = async () => {
    if (!isFormValid) return
    setIsLoading(true)
    try {
      await login(username, password)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!isFormValid) return
    setIsLoading(true)
    try {
      await register(username, password)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSwitch = (newForm: 'login' | 'register') => {
    setForm(newForm)
    setUsername("")
    setPassword("")
    setConfirmPassword("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      form === 'login' ? handleLogin() : handleRegister()
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className='bg-slate-800 text-gray-200'>
        {form === 'login' ? (
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>Log in to your account</DialogDescription> 
          </DialogHeader>
        ) : (
          <DialogHeader>
            <DialogTitle>Register</DialogTitle>
            <DialogDescription>Register a new account</DialogDescription>
          </DialogHeader>
          )}
          <div className="grid gap-4">
            {String(authError) && (
              <div className="bg-red-900/50 border border-red-700 rounded-md p-3">
                <p className="text-red-200 text-sm">
                  {String(typeof authError === 'string' ? authError : 
                   authError instanceof Error ? authError.message : 
                   'Authentication failed')}
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor='username'>Username</Label>
              <Input 
                id='username'
                type='text' 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className='bg-slate-700 border-slate-600 text-white'
                placeholder='Enter your username'
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor='password'>Password</Label>
              <Input 
                id='password'
                type='password' 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className='bg-slate-700 border-slate-600 text-white'
                placeholder='Enter your password'
                disabled={isLoading}
              />
            </div>
            
            {form === "register" && (
              <div className="grid gap-2">
                <Label htmlFor='confirm-password'>Confirm Password</Label>
                <Input 
                  id='confirm-password'
                  type='password' 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`bg-slate-700 border-slate-600 text-white ${
                    confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500' : ''
                  }`}
                  placeholder='Confirm your password'
                  disabled={isLoading}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-red-400 text-sm">Passwords do not match</p>
                )}
              </div>
            )}
            
            <Button 
              onClick={form === "login" ? handleLogin : handleRegister}
              disabled={!isFormValid || isLoading}
              className='bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white mt-2'
            >
              {isLoading ? 'Please wait...' : (form === "login" ? "Login" : "Register")}
            </Button>
          </div>
          <DialogFooter>
            <div className="w-full flex justify-center">
              {form === "login" ? (
                <div className='flex items-center justify-center gap-x-2 text-sm'>
                  <p className='text-gray-300'>Don't have an account?</p>
                  <Button 
                    className='text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 p-1 h-auto' 
                    variant={"ghost"} 
                    onClick={() => handleFormSwitch("register")}
                    disabled={isLoading}
                  >
                    Sign up
                  </Button>
                </div>
              ) : (
                <div className='flex items-center justify-center gap-x-2 text-sm'>
                  <p className='text-gray-300'>Already have an account?</p>
                  <Button 
                    className='text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 p-1 h-auto' 
                    variant={"ghost"} 
                    onClick={() => handleFormSwitch("login")}
                    disabled={isLoading}
                  >
                    Sign in
                  </Button>
                </div>
              )}
            </div>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog