"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "How it works", href: "/how-it-works" },
  { label: "For Ustaads", href: "/become-an-ustaad" },
  { label: "Contact", href: "mailto:support@handygo.ai" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/images/logo-green.png"
            alt="Handygo logo"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="font-bold text-lg tracking-tight" style={{ color: "var(--brand)" }}>
            Handygo
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-zinc-700 transition-all duration-200 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-zinc-700 transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-zinc-700 transition-all duration-200 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-5 pb-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm text-zinc-700 border-b border-zinc-50 last:border-0 font-medium"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
