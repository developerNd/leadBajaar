import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import LoginPage from '../page'
import { login } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  login: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Auth Flow Integration (LoginPage)', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  })

  it('renders login form correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
  })

  it('successful login flow redirects to dashboard', async () => {
    ;(login as jest.Mock).mockResolvedValueOnce({ token: 'fake-token' })

    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    
    fireEvent.submit(screen.getByRole('button', { name: /Sign in/i }))
    
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123')
    })
    
    expect(toast.success).toHaveBeenCalledWith('Welcome back!')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('failed login flow displays error message', async () => {
    const mockError = { message: 'The provided credentials are incorrect.' }
    ;(login as jest.Mock).mockRejectedValueOnce(mockError)

    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } })
    
    fireEvent.submit(screen.getByRole('button', { name: /Sign in/i }))
    
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'wrongpassword')
    })
    
    expect(await screen.findByText('The provided credentials are incorrect.')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
  
  it('validation errors are shown when submitting empty form', async () => {
    render(<LoginPage />)
    
    fireEvent.submit(screen.getByRole('button', { name: /Sign in/i }))
    
    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(await screen.findByText('Password is required')).toBeInTheDocument()
    
    expect(login).not.toHaveBeenCalled()
  })
})
