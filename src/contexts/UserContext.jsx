"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signOut as authSignOut, onAuthStateChange } from '@/services/authService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    const initUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };

    initUser();

    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Try to get user, but if it fails, try to construct from session
        let user = await getCurrentUser();
        
        // If getCurrentUser fails but we have a session, try to get user from session
        if (!user && session?.user) {
          const userMetadata = session.user.user_metadata || {};
          if (userMetadata.name && userMetadata.role) {
            user = {
              id: session.user.id,
              email: session.user.email,
              name: userMetadata.name,
              role: userMetadata.role,
            };
          }
        }
        
        setCurrentUser(user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (user) => {
    // This is kept for backward compatibility but user should be set via auth state change
    setCurrentUser(user);
  };

  const logout = async () => {
    await authSignOut();
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};
