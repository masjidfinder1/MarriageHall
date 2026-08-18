"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import type { Package } from "@/types";

interface PackagesSectionProps {
  packages: Package[];
}

export function PackagesSection({ packages }: PackagesSectionProps) {
  if (packages.length === 0) return null;

  return (
    <section id="packages" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Packages
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-3">
            Curated Event Packages
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            All-inclusive packages designed to make your planning effortless
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <ScrollReveal key={pkg.id} delay={index * 0.1}>
              <motion.div
                className={`relative bg-card rounded-2xl p-8 border transition-all duration-300 ${
                  pkg.featured 
                    ? "border-primary shadow-lg scale-105" 
                    : "border-border hover:shadow-md"
                }`}
                whileHover={{ y: -5 }}
              >
                {pkg.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      <Star className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                  {pkg.name}
                </h3>

                <p className="text-muted-foreground text-sm mb-6">
                  {pkg.description}
                </p>

                <div className="mb-6">
                  {pkg.price ? (
                    <span className="font-serif text-4xl font-bold text-primary">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </span>
                  ) : pkg.price_per_person ? (
                    <div>
                      <span className="font-serif text-4xl font-bold text-primary">
                        ₹{pkg.price_per_person.toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted-foreground text-sm"> /person</span>
                    </div>
                  ) : (
                    <span className="font-serif text-2xl font-bold text-primary">Custom Quote</span>
                  )}
                </div>

                {pkg.inclusions && pkg.inclusions.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {pkg.inclusions.slice(0, 6).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/booking?package=${pkg.id}`}
                  className={`block w-full text-center py-3 rounded-full font-medium transition-all ${
                    pkg.featured
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  Choose Package
                </Link>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
