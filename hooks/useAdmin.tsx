"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { User } from '@supabase/supabase-js';
import { Profile, SiteSettings } from '@/types';

interface AdminContextType {
  user: User | null;
  profile: Profile | null;
  settings: SiteSettings | null;
  loading: boolean;
  isAdmin: boolean;
  refetchSettings: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const { settings, loading: settingsLoading, refetch: refetchSettings } = useSiteSettings();

  const loading = authLoading || settingsLoading;

  return (
    <AdminContext.Provider
      value={{
        user,
        profile,
        settings,
        loading,
        isAdmin,
        refetchSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
