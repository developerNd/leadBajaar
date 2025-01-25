import { ChatbotNode, ChatbotEdge } from '@/types/nodes'

export interface SaveFlowPayload {
  id?: string
  name: string
  description: string
  trigger: string
  nodes: ChatbotNode[]
  edges: ChatbotEdge[]
}

export interface ChatbotFlow {
  id: string
  name: string
  description: string
  trigger: string
  updatedAt: string
  nodes: ChatbotNode[]
  edges: ChatbotEdge[]
}

class ChatbotService {
  private baseUrl = '/api/chatbot'

  async getFlows(): Promise<ChatbotFlow[]> {
    const response = await fetch(`${this.baseUrl}/flows`)
    if (!response.ok) {
      throw new Error('Failed to fetch flows')
    }
    return response.json()
  }

  async getFlow(id: string): Promise<ChatbotFlow> {
    const response = await fetch(`${this.baseUrl}/flows/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch flow')
    }
    return response.json()
  }

  async saveFlow(flow: SaveFlowPayload): Promise<ChatbotFlow> {
    const response = await fetch(`${this.baseUrl}/flows${flow.id ? `/${flow.id}` : ''}`, {
      method: flow.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flow),
    })
    if (!response.ok) {
      throw new Error('Failed to save flow')
    }
    return response.json()
  }

  async deleteFlow(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/flows/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete flow')
    }
  }

  async duplicateFlow(id: string): Promise<ChatbotFlow> {
    const response = await fetch(`${this.baseUrl}/flows/${id}/duplicate`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to duplicate flow')
    }
    return response.json()
  }

  async exportFlow(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/flows/${id}/export`)
    if (!response.ok) {
      throw new Error('Failed to export flow')
    }
    return response.blob()
  }

  async importFlow(file: File): Promise<ChatbotFlow> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/flows/import`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error('Failed to import flow')
    }
    return response.json()
  }
}

export const chatbotService = new ChatbotService() 