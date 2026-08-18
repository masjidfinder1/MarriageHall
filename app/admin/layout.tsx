import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminProvider } from "@/hooks/useAdmin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { data: insertedProfile, error: insertError } = await supabase
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
      .select("role, full_name")
      .maybeSingle();

    profile = insertedProfile;

    if (insertError || !profile) {
      redirect("/");
    }
  }

  if (!["admin", "manager", "staff"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <AdminProvider>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <AdminHeader user={user} profile={profile} />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
