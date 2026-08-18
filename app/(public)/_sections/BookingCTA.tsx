"use client";

import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import type { SiteSettings } from "@/types";

interface BookingCTAProps {
  settings: SiteSettings | null;
}

export function BookingCTA({ settings }: BookingCTAProps) {
  return (
    <section className="py-24 bg-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Create Your{" "}
            <span className="text-primary">Dream Event?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Book your date now and let us help you create unforgettable memories
            at {settings?.site_name || "our venue"}.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/booking"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              <Calendar className="w-5 h-5" />
              Book Your Date Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}
