import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUserId = localStorage.getItem('finance_user_id');
    if (storedUserId) {
      fetchUser(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (id) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;

      setUser(userData);
      
      if (userData.partner_id) {
        const { data: partnerData, error: partnerError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.partner_id)
          .single();
          
        if (!partnerError) {
          setPartner(partnerData);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('finance_user_id');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        throw new Error('Invalid credentials');
      }

      localStorage.setItem('finance_user_id', data.id);
      await fetchUser(data.id);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('finance_user_id');
    setUser(null);
    setPartner(null);
  };

  return (
    <AuthContext.Provider value={{ user, partner, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
