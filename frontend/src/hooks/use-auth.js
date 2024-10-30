'use client';

import { isEmpty } from '@/utils/Helpers';
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  const prepareSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      return setSession(data?.session);
    } catch (err) {
      return setSession({
        user: {},
        role: 'guest',
      });
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'DELETE',
    });
    await prepareSession();
  };

  const refreshSession = async () => {
    await prepareSession();
  };

  const isMFAConfigured = () => {
    return session?.mfa_1?.configured && session?.mfa_2?.configured;
  };

  const isMFAVerified = () => {
    return session?.mfa_1?.verified && session?.mfa_2?.verified;
  };

  const isAuthenticatedUser = () => {
    return session?.role === 'user' && isMFAConfigured() && isMFAVerified();
  };

  const isAuthenticatedAgent = () => {
    return session?.role === 'agent' && isMFAConfigured() && isMFAVerified();
  };

  return (
    <AuthContext.Provider
      value={{
        logout,
        session,
        setSession,
        prepareSession,
        refreshSession,
        isAuthenticatedUser,
        isAuthenticatedAgent,
        isAuthenticated: isAuthenticatedUser() || isAuthenticatedAgent(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
