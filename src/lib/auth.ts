// Simple session management using localStorage
export const getSession = async () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  return token ? { token } : null;
};

export const setSession = (token: string) => {
  localStorage.setItem('token', token);
};

export const clearSession = () => {
  localStorage.removeItem('token');
}; 