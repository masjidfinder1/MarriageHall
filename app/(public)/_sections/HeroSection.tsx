"use client";

import { motion } from "framer-motion";
import { ChevronDown, Calendar, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { SiteSettings } from "@/types";

interface HeroSectionProps {
  settings: SiteSettings | null;
}

export function HeroSection({ settings }: HeroSectionProps) {
  const heroVideoUrl = settings?.hero_video_url;
  const isYouTubeVideo = !!heroVideoUrl && /(youtu\.be|youtube\.com)/i.test(heroVideoUrl);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        {heroVideoUrl ? (
          isYouTubeVideo ? (
            <div className="w-full h-full">
              <iframe
                className="w-full h-full object-cover"
                src={heroVideoUrl.includes("embed") ? heroVideoUrl : `https://www.youtube.com/embed/${heroVideoUrl.split("v=")[1]?.split("&")[0] || heroVideoUrl.split("/").pop()}`}
                title="Hero video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
          )
        ) : settings?.hero_image_url ? (
          <Image
            src={settings.hero_image_url}
            alt={settings.site_name || "Hero"}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium tracking-wider uppercase bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            Premium Wedding & Event Venue
          </span>
        </motion.div>

        <motion.h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          {settings?.site_name || "Royal Marriage Hall"}
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          {settings?.tagline || "Where Dreams Come True"}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:opacity-90 transition-all hover:scale-105"
          >
            <Calendar className="w-5 h-5" />
            Book Your Date
          </Link>
          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium text-lg border border-white/30 hover:bg-white/20 transition-all"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8 text-white/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}
