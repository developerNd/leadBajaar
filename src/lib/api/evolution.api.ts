import api from './client';

export const evolutionApi = {
  getAccounts: async (): Promise<any> => {
    const response = await api.get('/evolution/accounts');
    return response.data;
  },
  createAccount: async (phoneNumber: string): Promise<any> => {
    const response = await api.post('/evolution/accounts', { phone_number: phoneNumber });
    return response.data;
  },
  connectInstance: async (instanceName: string): Promise<any> => {
    const response = await api.post(`/evolution/accounts/${instanceName}/connect`);
    return response.data;
  },
  getQrCode: async (instanceName: string): Promise<any> => {
    const response = await api.get(`/evolution/accounts/${instanceName}/qrcode`);
    return response.data;
  },
  getStatus: async (instanceName: string): Promise<any> => {
    const response = await api.get(`/evolution/accounts/${instanceName}/status`);
    return response.data;
  },
  disconnectInstance: async (instanceName: string): Promise<any> => {
    const response = await api.post(`/evolution/accounts/${instanceName}/disconnect`);
    return response.data;
  },
  deleteAccount: async (instanceName: string): Promise<any> => {
    const response = await api.delete(`/evolution/accounts/${instanceName}`);
    return response.data;
  },
  getConversations: async (): Promise<any> => {
    const response = await api.get('/evolution/inbox/conversations');
    return response.data;
  },
  getMessages: async (conversationId: number): Promise<any> => {
    const response = await api.get(`/evolution/inbox/conversations/${conversationId}/messages`);
    return response.data;
  },
  sendMessage: async (conversationId: number, message: string): Promise<any> => {
    const response = await api.post('/evolution/inbox/messages/send', {
      conversation_id: conversationId,
      message,
    });
    return response.data;
  },
  deleteConversation: async (conversationId: number): Promise<any> => {
    const response = await api.delete(`/evolution/inbox/conversations/${conversationId}`);
    return response.data;
  },
  clearSession: async (conversationId: number): Promise<any> => {
    const response = await api.post('/evolution/inbox/session/clear', {
      conversation_id: conversationId,
    });
    return response.data;
  }
};

