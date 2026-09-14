import React from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeadsPage from '../page'
import { renderWithQueryClient } from '@/test-utils/renderWithQueryClient'
import { getLeads, createLead, updateLead, bulkDeleteLeads, getStages, teamApi } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  getLeads: jest.fn(),
  createLead: jest.fn(),
  updateLeadDetails: jest.fn(),
  updateLead: jest.fn(),
  bulkDeleteLeads: jest.fn(),
  getStages: jest.fn(),
  deleteLead: jest.fn(),
  teamApi: {
    getAgents: jest.fn(),
    getMembers: jest.fn(),
  },
  integrationApi: {
    getWhatsAppAccounts: jest.fn(),
    getFacebookLeadForms: jest.fn(),
  }
}))

jest.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    user: { id: 1, name: 'Test User' },
    isLoading: false,
    hasRole: () => true,
    hasType: () => true,
    hasPlan: () => true,
    hasFeature: () => true,
  })
}))

jest.mock('@/utils/useErrorHandler', () => ({
  useErrorHandler: () => ({
    handleError: jest.fn(),
  })
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Leads CRUD Integration', () => {
  const mockPush = jest.fn()

  const mockLeadsData = {
    data: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'Acme Corp',
        stage: 'New',
        status: 'Active',
        source: 'Website',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        company: 'Global Inc',
        stage: 'Contacted',
        status: 'Active',
        source: 'Referral',
        created_at: new Date().toISOString(),
      }
    ],
    meta: {
      current_page: 1,
      total: 2,
      last_page: 1,
      per_page: 10,
    }
  }

  const mockLeads = mockLeadsData.data

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getLeads as jest.Mock).mockResolvedValue({
      data: mockLeads,
      meta: { total: 2, last_page: 1 }
    })
    ;(getStages as jest.Mock).mockResolvedValue({ data: [] })
    ;(teamApi.getMembers as jest.Mock).mockResolvedValue([])
  })

  it('renders the leads list correctly', async () => {
    renderWithQueryClient(<LeadsPage />)
    
    // Wait for the data to be fetched and rendered
    await waitFor(() => {
      expect(getLeads).toHaveBeenCalled()
    })
    
    // Verify rows are rendered
    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    expect(await screen.findByText('Jane Smith')).toBeInTheDocument()
  })

  it('can open Add Lead dialog and submit a new lead', async () => {
    ;(createLead as jest.Mock).mockResolvedValueOnce({ id: 3, name: 'New Lead' })

    renderWithQueryClient(<LeadsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click "Add Lead" button
    const addButton = screen.getByRole('button', { name: /Add Lead/i })
    fireEvent.click(addButton)
    
    // Wait for dialog to open
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    
    // Fill form
    const nameInput = screen.getByLabelText(/Name/i)
    fireEvent.change(nameInput, { target: { value: 'Alice Wonderland' } })
    
    const emailInput = screen.getByLabelText(/Email/i)
    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } })
    
    // Submit
    const submitButtons = screen.getAllByRole('button', { name: /Add Lead/i })
    const submitButton = submitButtons[submitButtons.length - 1]
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(createLead).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Alice Wonderland',
        email: 'alice@example.com'
      }))
    })
    
    expect(toast.success).toHaveBeenCalledWith('Lead created successfully')
  })

  it('can edit a lead', async () => {
    ;(updateLead as jest.Mock).mockResolvedValueOnce({ id: 1, name: 'John Doe Updated' })
    
    renderWithQueryClient(<LeadsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click the first edit button (for John Doe)
    const editButtons = screen.getAllByRole('button', { name: /Edit lead/i })
    fireEvent.click(editButtons[0])
    
    // Wait for dialog
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    
    // Change name
    const nameInput = screen.getByDisplayValue('John Doe')
    fireEvent.change(nameInput, { target: { value: 'John Doe Updated' } })
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(updateLead).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'John Doe Updated'
      }))
    })
    
    expect(toast.success).toHaveBeenCalledWith('Lead updated successfully')
  })

  it('can bulk delete leads', async () => {
    ;(bulkDeleteLeads as jest.Mock).mockResolvedValueOnce({})
    
    renderWithQueryClient(<LeadsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click the "Select All" checkbox
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAllCheckbox)
    
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    
    // Click the bulk delete button
    const deleteButton = screen.getByRole('button', { name: /^Delete$/i })
    fireEvent.click(deleteButton)
    
    // Verify window.confirm was called
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete the selected leads?')
    
    await waitFor(() => {
      // The IDs of the mocked leads are 1 and 2
      expect(bulkDeleteLeads).toHaveBeenCalledWith([1, 2])
    })
    
    expect(toast.success).toHaveBeenCalledWith('Leads deleted successfully')
  })
})
