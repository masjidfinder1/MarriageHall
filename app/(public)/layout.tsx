import { createClient } from "@/lib/supabase-server";
import { ThemeProvider } from "@/components/public/ThemeProvider";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";
import type { SiteSettings } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .maybeSingle();

  const features = (settings?.features_enabled as Record<string, boolean>) || {};

  return (
    <ThemeProvider settings={settings}>
      <div className="min-h-screen flex flex-col">
        <PublicNavbar settings={settings} />
        <main className="flex-1">{children}</main>
        <PublicFooter settings={settings} />

        {features.whatsapp !== false && (
          <WhatsAppButton 
            phoneNumber={settings?.whatsapp_number} 
            message={`Hi ${settings?.site_name || ""}! I'm interested in booking your venue.`}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
