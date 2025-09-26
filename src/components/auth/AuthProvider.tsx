import React, { createContext } from 'react';
import { useAuthProvider } from '@/hooks/useAuth';

const AuthContext = createContext<ReturnType<typeof useAuthProvider> | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}