"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Send,
  ArrowRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               DATA CONFIG                                  */
/* -------------------------------------------------------------------------- */

const footerLinks = [
  {
    title: "Shop",
    links: [
      { name: "All Products", href: "/#" },
      { name: "Best Sellers", href: "/#" },
      { name: "Deals", href: "/#" },
      { name: "New Arrivals", href: "/#" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Shipping", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-500" },
  { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-400" },
  { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-500" },
  { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
];

/* -------------------------------------------------------------------------- */
/*                                  FOOTER                                    */
/* -------------------------------------------------------------------------- */

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) return;

    setSubscribed(true);
    setEmail("");

    // simulate API
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-16 pb-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* ------------------------------------------------------------------ */}
        {/* GRID CONTENT                                                       */}
        {/* ------------------------------------------------------------------ */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* BRAND */}
          <section className="lg:col-span-4 space-y-6">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Send className="text-white -rotate-12" size={20} />
              </div>

              <span className="text-2xl font-bold text-white tracking-tight">
                  AfriMart
              </span>
            </div>

            <p className="text-zinc-400 leading-relaxed max-w-sm">
              Crafting premium shopping experiences since 2024.
              We focus on quality, sustainability, and lightning-fast delivery.
            </p>

            {/* SOCIAL LINKS */}
            <div className="flex items-center gap-5">

              {socialLinks.map((social) => (
                <SocialIcon key={social.label} {...social} />
              ))}

            </div>

          </section>

          {/* NAVIGATION */}
          <nav
            aria-label="Footer Navigation"
            className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-8"
          >
            {footerLinks.map((group) => (
              <FooterColumn key={group.title} {...group} />
            ))}
          </nav>

          {/* NEWSLETTER */}
          <section className="lg:col-span-4">

            <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 backdrop-blur-sm">

              <h4 className="text-lg font-semibold text-white mb-2">
                Join the Circle
              </h4>

              <p className="text-sm text-zinc-400 mb-6">
                Receive curated deals and early access to new collections.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-3">

                <div className="relative group">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="
                    w-full
                    pl-10
                    pr-4
                    py-3
                    bg-zinc-800
                    border border-zinc-700
                    rounded-xl
                    text-white
                    placeholder-zinc-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-600/50
                    "
                  />

                </div>

                <button
                  type="submit"
                  disabled={subscribed}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    subscribed
                      ? "bg-emerald-500 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                  }`}
                >
                  {subscribed ? (
                    "Subscribed 🎉"
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </form>

            </div>

          </section>

        </div>

        {/* ------------------------------------------------------------------ */}
        {/* BOTTOM BAR                                                         */}
        {/* ------------------------------------------------------------------ */}

        <div className="pt-8 border-t border-zinc-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-zinc-500">

          <div className="flex flex-wrap justify-center gap-6">

            <p>© {new Date().getFullYear()} AfriMart Global Ltd.</p>

            <Link href="/privacy" className="hover:text-zinc-300">
              Privacy
            </Link>

            <Link href="/terms" className="hover:text-zinc-300">
              Terms
            </Link>

            <Link href="/cookies" className="hover:text-zinc-300">
              Cookies
            </Link>

          </div>

          <div className="flex items-center gap-2 text-zinc-600">
            Built with
            <span className="text-red-500">❤️</span>
            by AfriMart
          </div>

        </div>

      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*                         REUSABLE COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function FooterColumn({ title, links }) {
  return (
    <div className="space-y-4">

      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
        {title}
      </h4>

      <ul className="space-y-3">

        {links.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              {link.name}
            </Link>
          </li>
        ))}

      </ul>

    </div>
  );
}

function SocialIcon({ icon: Icon, href, label, color }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`transition-all duration-300 transform hover:-translate-y-1 ${color} text-zinc-500 hover:scale-110`}
    >
      <Icon size={22} strokeWidth={1.5} />
    </Link>
  );
}