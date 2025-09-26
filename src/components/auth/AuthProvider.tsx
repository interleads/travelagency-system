import React, { createContext, useContext } from 'react';
import { useAuthProvider } from '@/hooks/useAuth';

export const AuthContext = createContext<ReturnType<typeof useAuthProvider> | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}