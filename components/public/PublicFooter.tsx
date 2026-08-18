"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import type { SiteSettings } from "@/types";

interface PublicFooterProps {
  settings: SiteSettings | null;
}

export function PublicFooter({ settings }: PublicFooterProps) {
  if (!settings) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold">{settings.site_name}</h3>
            <p className="text-accent-foreground/80 text-sm leading-relaxed">
              {settings.description || settings.tagline}
            </p>
            <div className="flex gap-4">
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/#about" className="text-accent-foreground/80 hover:text-primary transition-colors text-sm">About Us</a></li>
              <li><a href="/#venues" className="text-accent-foreground/80 hover:text-primary transition-colors text-sm">Our Venues</a></li>
              <li><a href="/#packages" className="text-accent-foreground/80 hover:text-primary transition-colors text-sm">Packages</a></li>
              <li><a href="/#gallery" className="text-accent-foreground/80 hover:text-primary transition-colors text-sm">Gallery</a></li>
              <li><Link href="/booking" className="text-accent-foreground/80 hover:text-primary transition-colors text-sm">Book Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-accent-foreground/80 hover:text-primary transition-colors text-sm">
                    <Phone className="w-4 h-4" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-accent-foreground/80 hover:text-primary transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-3 text-accent-foreground/80 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{settings.address}{settings.city && !settings.address.includes(settings.city) ? `, ${settings.city}` : ""}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Business Hours</h4>
            <ul className="space-y-2 text-sm text-accent-foreground/80">
              {settings.business_hours && Object.entries(settings.business_hours as Record<string, string>).map(([day, hours]) => (
                <li key={day} className="flex justify-between">
                  <span className="capitalize">{day}</span>
                  <span>{hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-accent-foreground/10 text-center text-sm text-accent-foreground/60">
          <p>© {currentYear} {settings.site_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
