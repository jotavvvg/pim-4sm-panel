import { useEffect, useState, type ReactNode } from 'react';

import { AuthContext } from '@/auth/auth-context';
import { bootstrapAdmin, login as loginRequest } from '@/lib/api';
import type { UserRole } from '@/types/entities';

function readRole(): UserRole | null {
  const role = sessionStorage.getItem('bestauth_role');
  return role === 'ADMIN' || role === 'PROFESSOR' || role === 'ALUNO' ? role : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(readRole);

  const persistSession = (token: string, nextRole: UserRole) => {
    sessionStorage.setItem('bestauth_token', token);
    sessionStorage.setItem('bestauth_role', nextRole);
    setRole(nextRole);
  };

  const logout = () => {
    sessionStorage.removeItem('bestauth_token');
    sessionStorage.removeItem('bestauth_role');
    setRole(null);
  };

  useEffect(() => {
    window.addEventListener('bestauth:expired', logout);
    return () => window.removeEventListener('bestauth:expired', logout);
  }, []);

  const authenticate = async (username: string, password: string) => {
    const response = await loginRequest(username, password);
    persistSession(response.token, response.role);
  };

  const bootstrap = (username: string, password: string) => bootstrapAdmin(username, password).then(() => undefined);

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated: Boolean(role && sessionStorage.getItem('bestauth_token')),
        login: authenticate,
        bootstrap,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}