"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { SiteSettings } from "@/types";

interface PublicNavbarProps {
  settings: SiteSettings | null;
}

export function PublicNavbar({ settings }: PublicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = (settings?.features_enabled as Record<string, boolean>) || {};
  const navLinks = [
    { href: "/", label: "Home", enabled: true },
    { href: "/#about", label: "About", enabled: features.about },
    { href: "/#venues", label: "Venues", enabled: features.venues },
    { href: "/#rooms", label: "Rooms", enabled: features.rooms },
    { href: "/#packages", label: "Packages", enabled: features.packages },
    { href: "/#services", label: "Services", enabled: features.services },
    { href: "/#gallery", label: "Gallery", enabled: features.gallery },
    { href: "/#testimonials", label: "Reviews", enabled: features.testimonials },
    { href: "/#faq", label: "FAQ", enabled: features.faq },
    { href: "/#contact", label: "Contact", enabled: features.contact },
  ].filter((link) => link.enabled !== false);

  const handleHashNav = (href: string) => {
    if (!href.startsWith("/#") && !href.startsWith("#")) return;

    const targetId = href.replace(/^\/?#/, "");
    const normalizedPath = pathname === "/" ? "/" : "/";

    const scrollToSection = () => {
      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${targetId}`);
        return true;
      }
      return false;
    };

    if (pathname === "/") {
      if (!scrollToSection()) {
        router.push(`/#${targetId}`);
      }
      return;
    }

    router.push(`/#${targetId}`);
    setTimeout(() => {
      if (!scrollToSection()) {
        const fallback = document.getElementById(targetId);
        if (fallback) {
          fallback.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 100);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            {settings?.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={settings.site_name || "Logo"}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif text-lg font-bold">
                  {(settings?.site_name || "M")[0]}
                </span>
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-serif text-xl font-bold text-foreground leading-tight">
                {settings?.site_name || "Marriage Hall"}
              </h1>
              <p className="text-xs text-muted-foreground">{settings?.tagline}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isHashLink = link.href.startsWith("/#") || link.href.startsWith("#");

              return isHashLink ? (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => {
                    handleHashNav(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                {settings.phone}
              </a>
            )}
            {features.booking !== false && (
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Calendar className="w-4 h-4" />
                Book Now
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-md border-b border-border"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => {
                const isHashLink = link.href.startsWith("/#") || link.href.startsWith("#");
                return isHashLink ? (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => {
                      handleHashNav(link.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                );
              })}

              {features.booking !== false && (
                <Link
                  href="/booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-5 py-3 bg-primary text-primary-foreground rounded-full font-medium"
                >
                  Book Now
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
