'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { login, loginWithGoogle } from '@/lib/api'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"


type LoginFormData = {
  email: string
  password: string
  remember?: boolean
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors }, setValue, setError } = useForm<LoginFormData>()

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials')
    if (savedCredentials) {
      const { email, password } = JSON.parse(savedCredentials)
      setValue('email', email)
      setValue('password', password)
      setValue('remember', true)
    }
  }, [setValue])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { email, password, remember } = data
      
      if (remember) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({ email, password }))
      } else {
        localStorage.removeItem('rememberedCredentials')
      }

      await login(email, password)
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      })
      router.push('/dashboard')
    } catch (error) {
      // Don't log expected errors
      setValue('password', '')
      if (error instanceof Error) {
        setError('root', {
          type: 'manual',
          message: error.message
        })
      } else {
        // Only log unexpected errors
        console.error('Unexpected login error:', error)
        setError('root', {
          type: 'manual',
          message: 'An unexpected error occurred'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const token = await fakeGoogleAuth()
      await loginWithGoogle(token)
      router.push('/dashboard')
    } catch (error) {
      console.error('Google login failed:', error)
      toast({
        title: "Google login failed",
        description: "An error occurred during Google login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // This is a placeholder function to simulate Google authentication
  const fakeGoogleAuth = () => {
    return new Promise<string>((resolve) => {
      setTimeout(() => resolve("fake_google_token"), 1000)
    })
  }

  // Function to clear saved credentials
  const clearSavedCredentials = () => {
    localStorage.removeItem('rememberedCredentials')
    setValue('email', '')
    setValue('password', '')
    setValue('remember', false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className={cn(
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                className={cn(
                  errors.password && "border-red-500 focus-visible:ring-red-500"
                )}
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            {errors.root && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-500">{errors.root.message}</p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" {...register('remember')} />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSavedCredentials}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Clear saved credentials
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Log in
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

