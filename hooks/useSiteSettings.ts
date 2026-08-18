"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { SiteSettings } from "@/types";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<SiteSettings>) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .update(updates)
        .eq("id", settings?.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Update failed" 
      };
    }
  }, [settings?.id]);

  return { settings, loading, error, refetch: fetchSettings, updateSettings };
}
