"use client";

import { User } from "@supabase/supabase-js";
import { Bell, UserCircle } from "lucide-react";
import type { Profile } from "@/types";

interface AdminHeaderProps {
  user: User;
  profile: Pick<Profile, "role" | "full_name"> | null;
}

export function AdminHeader({ user, profile }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground capitalize">
          {profile?.role || "Admin"} Dashboard
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{profile?.full_name || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
