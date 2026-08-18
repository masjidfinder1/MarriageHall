"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        let { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          const { data: createdProfile } = await supabase
            .from("profiles")
            .upsert(
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email,
                role: "admin",
              },
              { onConflict: "id" }
            )
            .select("*")
            .maybeSingle();
          profile = createdProfile;
        }

        setProfile(profile);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          let { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!profile) {
            const { data: createdProfile } = await supabase
              .from("profiles")
              .upsert(
                {
                  id: session.user.id,
                  email: session.user.email,
                  full_name: session.user.user_metadata?.full_name || session.user.email,
                  role: "admin",
                },
                { onConflict: "id" }
              )
              .select("*")
              .maybeSingle();
            profile = createdProfile;
          }

          setProfile(profile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = createClient();
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    const supabase = createClient();
    return supabase.auth.signOut();
  };

  const isAdmin = profile?.role === "admin" || profile?.role === "manager" || profile?.role === "staff";

  return { user, profile, loading, isAdmin, signIn, signOut };
}
