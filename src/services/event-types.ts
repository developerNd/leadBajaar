import { api } from '@/lib/api'
import { EventType } from '@/types/events'

export const eventTypeService = {
  async getAll(): Promise<EventType[]> {
    const response = await api.get('/event-types')
    return Array.isArray(response.data) ? response.data : response.data.data
  },

  async getById(id: string | number): Promise<EventType> {
    const response = await api.get(`/event-types/${id}`)
    return response.data.data || response.data
  },

  async create(data: Omit<EventType, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventType> {
    const response = await api.post('/event-types', data)
    return response.data.data || response.data
  },

  async update(id: string | number, data: Partial<EventType>): Promise<EventType> {
    const response = await api.put(`/event-types/${id}`, data)
    return response.data.data || response.data
  },

  async delete(id: string | number): Promise<void> {
    await api.delete(`/event-types/${id}`)
  }
} 