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
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  private async fetchApi(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token') // or get from your auth system
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  async getFlows(): Promise<ChatbotFlow[]> {
    try {
      const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows`)
      const data = await response.data || response

      // Ensure we return data in the correct format
      return (Array.isArray(data) ? data : []).map(flow => ({
        id: flow.id,
        name: flow.name || '',
        description: flow.description || '',
        trigger: flow.trigger || 'message',
        updatedAt: flow.updated_at || flow.updatedAt || new Date().toISOString(),
        nodes: flow.nodes || [],
        edges: flow.edges || [],
      }))
    } catch (error) {
      console.error('Error fetching flows:', error)
      throw error
    }
  }

  async getFlow(id: string): Promise<ChatbotFlow> {
    try {
      const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}`)
      const data = await response.data || response

      // Ensure we return data in the correct format
      return {
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        trigger: data.trigger || 'message',
        updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
        nodes: data.nodes || [],
        edges: data.edges || [],
      }
    } catch (error) {
      console.error('Error fetching flow:', error)
      throw error
    }
  }

  async saveFlow(flow: SaveFlowPayload): Promise<ChatbotFlow> {
    const url = `${this.baseUrl}/chatbot/flows${flow.id ? `/${flow.id}` : ''}`
    const method = flow.id ? 'PUT' : 'POST'

    try {
      const response = await this.fetchApi(url, {
        method,
        body: JSON.stringify({
          name: flow.name,
          description: flow.description,
          trigger: flow.trigger,
          nodes: flow.nodes,
          edges: flow.edges,
        }),
      })

      const flowData = response.data || response

      // Ensure we return data in the correct format
      return {
        id: flowData.id,
        name: flowData.name || '',
        description: flowData.description || '',
        trigger: flowData.trigger || 'message',
        updatedAt: flowData.updated_at || flowData.updatedAt || new Date().toISOString(),
        nodes: flowData.nodes || [],
        edges: flowData.edges || [],
      }
    } catch (error) {
      console.error('Error saving flow:', error)
      throw error
    }
  }

  async deleteFlow(id: string): Promise<void> {
    await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}`, {
      method: 'DELETE',
    })
  }

  async duplicateFlow(id: string): Promise<ChatbotFlow> {
    const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}/duplicate`, {
      method: 'POST',
    })
    return response.data || response
  }

  async exportFlow(id: string): Promise<Blob> {
    const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}/export`)
    return response.blob()
  }

  async importFlow(file: File): Promise<ChatbotFlow> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/chatbot/flows/import`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || 'Failed to import flow')
    }

    return response.json()
  }
}

export const chatbotService = new ChatbotService() 