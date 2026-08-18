"use client";

import { ScrollReveal } from "@/components/public/ScrollReveal";
import Image from "next/image";
import type { SiteSettings } from "@/types";

interface AboutSectionProps {
  settings: SiteSettings | null;
}

export function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                {settings?.about_image_url ? (
                  <Image
                    src={settings.about_image_url}
                    alt={settings.site_name || "About"}
                    fill
                    className="object-cover"
                  />
                ) : settings?.cover_image_url ? (
                  <Image
                    src={settings.cover_image_url}
                    alt={settings.site_name || "About"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <span className="text-6xl font-serif text-primary/30">About</span>
                  </div>
                )}
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 border-2 border-primary/20 rounded-2xl -z-10" />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div className="space-y-6">
              <span className="text-primary font-medium tracking-wider uppercase text-sm">
                About Us
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                {settings?.about_title ? (
                  <>
                    {settings.about_title.split(" ").slice(0, -1).join(" ")}
                    <span className="text-primary"> {settings.about_title.split(" ").slice(-1)[0]}</span>
                  </>
                ) : (
                  <>
                    Creating Unforgettable
                    <span className="text-primary"> Moments</span>
                  </>
                )}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {settings?.about_description || settings?.about_subtitle || 
                  "We are a premier marriage hall and banquet venue dedicated to making your special day truly memorable. With state-of-the-art facilities, exquisite decor, and impeccable service, we ensure every event is nothing short of perfection."
                }
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="border-l-2 border-primary pl-4">
                  <span className="font-serif text-3xl font-bold text-foreground">
                    {settings?.years_experience || "10+"}
                  </span>
                  <p className="text-muted-foreground text-sm mt-1">Years Experience</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <span className="font-serif text-3xl font-bold text-foreground">
                    {settings?.events_hosted || "500+"}
                  </span>
                  <p className="text-muted-foreground text-sm mt-1">Events Hosted</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <span className="font-serif text-3xl font-bold text-foreground">
                    {settings?.team_members || "50+"}
                  </span>
                  <p className="text-muted-foreground text-sm mt-1">Team Members</p>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <span className="font-serif text-3xl font-bold text-foreground">
                    {settings?.satisfaction_percentage || "100%"}
                  </span>
                  <p className="text-muted-foreground text-sm mt-1">Satisfaction</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
