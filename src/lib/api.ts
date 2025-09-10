import axios, { AxiosError } from 'axios';
import { setSession, clearSession, getSession } from './auth';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_BASE_URL ='https://api.leadbajaar.com/api'

// Export both httpClient and api
export const httpClient = {
  async get(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`)
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async post(url: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async put(url: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async delete(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include token in headers
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token') // or get from your auth system
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LoginError {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

interface ErrorResponse {
  message?: string;
}

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', { email, password });
    // Store the actual token from the response
    const token = response.data.token || response.data.access_token;
    if (!token) {
      throw new Error('No token received from server');
    }
    setSession(token);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<LoginError>;
      // Don't log the error to console for expected errors like invalid credentials
      if (axiosError.response?.status === 422) {
        throw new Error(axiosError.response.data.message || 'Invalid credentials');
      }
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    // Only log unexpected errors
    console.error('Unexpected error during login:', error);
    throw new Error('An unexpected error occurred');
  }
};

export const register = async (name: string, email: string, password: string, password_confirmation: string) => {
  const response = await api.post('/register', { name, email, password, password_confirmation });
  setSession('your_auth_token');
  return response.data;
};

export const logout = async () => {
  try {
    const session = await getSession();
    if (!session?.token) {
      clearSession();
      return true;
    }
    
    await api.post('/logout', {}, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    clearSession();
    return true;
  } catch (error) {
    clearSession(); // Clear session even if logout fails
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    throw new Error('Logout failed');
  }
};

export const getUser = async () => {
  const response = await api.get('/user');
  return response.data;
};

export const loginWithGoogle = async (token: string) => {
  const response = await api.post('/login/google', { token });
  setSession(token);
  return response.data;
};

// Update or add these interfaces
export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: string;
  status?: 'Hot' | 'Warm' | 'Cold';
  source?: string;
}

export interface ImportLeadDto {
  leads: CreateLeadDto[];
}

// Add these functions
export const createLead = async (data: CreateLeadDto) => {
  try {
    const response = await api.post('/leads', {
      ...data,
      stage: data.stage || 'New'
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (typeof validationErrors === 'object') {
          const messages = Object.entries(validationErrors)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
            .join('\n');
          throw new Error(messages);
        }
      }
      
      // Handle server errors (500) - Show generic message instead of actual error
      if (error.response?.status === 500) {
        // Still log the actual error for debugging
        console.error('Server Error:', error.response.data);
        throw new Error('An error occurred. Please try again later or contact support if the problem persists.');
      }

      // Handle other HTTP errors with generic messages
      throw new Error('Unable to create lead. Please try again.');
    }
    
    // Log unexpected errors but show generic message
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

export const importLeads = async (data: ImportLeadDto) => {
  const response = await api.post('/leads/import', data);
  return response.data;
};

// Add these interfaces
export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  stage: string;
  status: 'Hot' | 'Warm' | 'Cold';
  source: string;
  last_contact: string;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  data: Lead[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Add these API functions
interface GetLeadsParams {
  page?: number;
  search?: string;
  status?: string;
  stage?: string;
  source?: string;
  last_contact_from?: string;
  last_contact_to?: string;
  created_from?: string;
  created_to?: string;
  per_page?: number;
}

export const getLeads = async (params: GetLeadsParams) => {
  try {
    const response = await api.get('/leads', { params });
    
    // If the response is already in the correct format, return it
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data;
    }
    
    // If we get an array directly, wrap it in the expected format
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: {
          current_page: params.page || 1,
          from: 1,
          last_page: 1,
          per_page: response.data.length,
          to: response.data.length,
          total: response.data.length
        }
      };
    }
    
    // Return the response data as is
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

export const deleteLead = async (id: number) => {
  await api.delete(`/leads/${id}`);
};

export const bulkDeleteLeads = async (ids: number[]) => {
  await api.post('/leads/bulk-destroy', { ids });
};

export const bulkUpdateLeadStatus = async (ids: number[], status: string) => {
  await api.post('/leads/bulk-update-status', { ids, status });
};

export const updateLead = async (id: number, data: Partial<Lead>) => {
  const response = await api.put<Lead>(`/leads/${id}`, data);
  return response.data;
};

export const updateLeadStage = async (id: number, stage: string) => {
  const response = await api.patch(`/leads/${id}/stage`, { stage });
  return response.data;
};

export const updateLeadDetails = async (id: number, data: Partial<Lead>) => {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
};

// Types for API requests
interface IntegrationConfig {
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  environment: 'sandbox' | 'production';
}

// API functions for integrations
export const integrationApi = {
  // Get all integrations
  getIntegrations: async () => {
    try {
      const response = await api.get('/integrations');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch integrations';
      throw new Error(message);
    }
  },

  // Save integration configuration
  saveIntegration: async (config: IntegrationConfig) => {
    try {
      const response = await api.post('/integrations', config);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save integration configuration';
      throw new Error(message);
    }
  },

  // Update integration status
  updateIntegrationStatus: async (id: string, isActive: boolean) => {
    try {
      const response = await api.patch(`/integrations/${id}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update integration status';
      throw new Error(message);
    }
  },

  // Get integration logs
  getIntegrationLogs: async (id: string) => {
    try {
      const response = await api.get(`/integrations/${id}/logs`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch integration logs';
      throw new Error(message);
    }
  },

  getWhatsAppProfiles: async () => {
    try {
      const response = await api.get('/integrations/whatsapp/profiles');
      console.log(response.data);
      return response.data.profiles;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch WhatsApp profiles';
      throw new Error(message);
    }
  },

  getWhatsAppAccounts: async () => {
    try {
      const response = await api.get('/integrations/whatsapp/accounts');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch WhatsApp accounts';
      throw new Error(message);
    }
  },

  getWhatsAppTemplates: async (accountId: number) => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/templates`);
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch templates';
      throw new Error(message);
    }
  },

  syncWhatsAppTemplates: async (accountId: number) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/sync-templates`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to sync templates';
      throw new Error(message);
    }
  },

  createWhatsAppTemplate: async (accountId: number, templateData: any) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/templates`, templateData);
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Format validation errors
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Validation failed: ${errorMessages}`);
      } else if (error.response?.status === 401 && error.response?.data?.error_type === 'token_expired') {
        throw new Error('Your WhatsApp access token has expired. Please update your access token.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to create template');
      }
    }
  },

  checkIntegrationStatus: async (accountId: number) => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/status`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to check integration status';
      throw new Error(message);
    }
  },

  markReauthenticated: async (accountId: number) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/reauth`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark integration as re-authenticated';
      throw new Error(message);
    }
  },

  updateAccessToken: async (accountId: number, accessToken: string) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/update-token`, {
        access_token: accessToken
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error_type === 'invalid_token') {
        throw new Error('Invalid access token. Please check your token and try again.');
      }
      const message = error.response?.data?.message || 'Failed to update access token';
      throw new Error(message);
    }
  },



  updateWhatsAppTemplate: async (accountId: number, templateId: string, templateData: any) => {
    try {
      const response = await api.put(`/integrations/whatsapp/${accountId}/templates/${templateId}`, templateData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update template';
      throw new Error(message);
    }
  },

  deleteWhatsAppTemplate: async (accountId: number, templateId: string) => {
    try {
      const response = await api.delete(`/integrations/whatsapp/${accountId}/templates/${templateId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete template';
      throw new Error(message);
    }
  },

  getWhatsAppTemplateDetails: async (accountId: number, templateId: string) => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/templates/${templateId}/details`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get template details';
      throw new Error(message);
    }
  },

  getConnectedIntegrations: async () => {
    try {
      const response = await api.get('/integrations/connected');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch connected integrations';
      throw new Error(message);
    }
  },

  // Add the sendBroadcast method
  sendBroadcast: async (data: {
    template_id: string;
    lead_ids: number[];
    variables: Record<string, string>;
    variable_column_mapping: Record<string, string>;
  }) => {
    const response = await api.post('/leads/send-template', data);
    return response.data;
  },

  // Facebook Lead Retrieval Methods
  getFacebookLeadForms: async () => {
    try {
      const response = await api.get('/facebook-lead-forms');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch Facebook lead forms';
      throw new Error(message);
    }
  },

  debugIntegrations: async () => {
    try {
      const response = await api.get('/debug-integrations');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to debug integrations';
      throw new Error(message);
    }
  },

  retrieveFacebookLeads: async (data: {
    form_id: string;
    integration_id: number;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      const response = await api.post('/facebook-lead-retrieval', data);
      return response.data;
    } catch (error: any) {
      // Enhanced error handling to preserve error details from backend
      if (error.response?.data) {
        // Create a new error with the backend's error details
        const backendError = new Error(error.response.data.error || 'Failed to retrieve Facebook leads');
        // Attach the response data to the error for the frontend to use
        (backendError as any).response = error.response;
        throw backendError;
      }
      throw new Error('Failed to retrieve Facebook leads');
    }
  },
};

// Add export functions
export const exportLeads = async (ids?: number[]) => {
  try {
    const response = await api.post('/leads/export', { ids }, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv',
        'Content-Type': 'application/json',
      }
    });
    
    // Get filename from response headers or use default
    const filename = response.headers['content-disposition']?.split('filename=')[1] || 
      `leads-${new Date().toISOString().split('T')[0]}.csv`;
    
    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    if (axios.isAxiosError(error)) {
      // Handle different error types
      if (error.response?.status === 404) {
        throw new Error('No leads found to export.');
      }
      throw new Error('Failed to export leads. Please try again.');
    }
    throw new Error('An unexpected error occurred during export.');
  }
};

export const sendMessage = async (data: {
  receiver_id: number;
  sender_id: number;
  message: string;
}) => { 
  const response = await api.post('/send-message', data);
  return response.data;
};

export const authorize = async (data: {
  socket_id: string;
  channel_name: string;
}) => {
  const response = await api.post('/broadcasting/auth', data);
  return response.data;
};

export const getMessages = async (data: {
  user_id: number;
}) => {
  const response = await api.post('/messages', data);
  return response.data;
};

export const initializeChat = async (data: {
  user_id: number;
}) => {
  const response = await api.post('/initialize-chat', data);
  return response.data;
};

export const getLeadsWithLatestMessages = async () => {
  try {
    const response = await api.get('/conversations', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: number, lastTimestamp?: string) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      params: {
        after: lastTimestamp
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const getBookings = async () => {
  const response = await api.get('/bookings', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  console.log(response.data);
  return response;
};

export default api;


