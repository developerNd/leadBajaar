import { ChatbotNode, ChatbotEdge } from '@/types/nodes'

interface Flow {
  id: string
  name: string
  description: string
  trigger: string
  updatedAt: string
  nodes: ChatbotNode[]
  edges: ChatbotEdge[]
}

interface CreateFlowInput {
  name: string
  description: string
  trigger: string
}

interface UpdateFlowInput extends Partial<CreateFlowInput> {
  nodes?: ChatbotNode[]
  edges?: ChatbotEdge[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const chatbotService = {
  // Get all flows
  getFlows: async (): Promise<Flow[]> => {
    const response = await fetch(`${API_URL}/chatbot/flows`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    })
    if (!response.ok) throw new Error('Failed to fetch flows')
    return response.json()
  },

  // Get single flow
  getFlow: async (flowId: string): Promise<Flow> => {
    const response = await fetch(`${API_URL}/chatbot/flows/${flowId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    })
    if (!response.ok) throw new Error('Failed to fetch flow')
    return response.json()
  },

  // Create new flow
  createFlow: async (input: CreateFlowInput): Promise<Flow> => {
    const response = await fetch(`${API_URL}/chatbot/flows`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) throw new Error('Failed to create flow')
    return response.json()
  },

  // Update flow
  updateFlow: async (flowId: string, input: UpdateFlowInput): Promise<Flow> => {
    const response = await fetch(`${API_URL}/chatbot/flows/${flowId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) throw new Error('Failed to update flow')
    return response.json()
  },

  // Delete flow
  deleteFlow: async (flowId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/chatbot/flows/${flowId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    })
    if (!response.ok) throw new Error('Failed to delete flow')
  },
} 