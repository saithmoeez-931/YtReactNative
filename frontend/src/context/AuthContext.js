import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'society_connect_session';

export function AuthProvider({ children }) {
  const [session, setSession] = useState({
    token: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const rawSession = await AsyncStorage.getItem(STORAGE_KEY);

      if (!rawSession) {
        setSession({ token: null, user: null, loading: false });
        return;
      }

      const parsedSession = JSON.parse(rawSession);
      const profile = await api.getProfile(parsedSession.token);

      const nextSession = {
        token: parsedSession.token,
        user: profile.user,
        loading: false,
      };

      setSession(nextSession);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    } catch (error) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSession({ token: null, user: null, loading: false });
    }
  };

  const saveSession = async data => {
    const nextSession = {
      token: data.token,
      user: data.user,
      loading: false,
    };

    setSession(nextSession);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  };

  const login = async payload => {
    const data = await api.login(payload);
    await saveSession(data);
  };

  const register = async payload => {
    const data = await api.register(payload);
    await saveSession(data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession({ token: null, user: null, loading: false });
  };

  const refreshProfile = async () => {
    if (!session.token) {
      return;
    }

    const data = await api.getProfile(session.token);
    await saveSession({ token: session.token, user: data.user });
  };

  return (
    <AuthContext.Provider
      value={{
        ...session,
        login,
        logout,
        refreshProfile,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
