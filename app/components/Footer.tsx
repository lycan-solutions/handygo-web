import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="text-zinc-400 pt-16 pb-8 px-5 sm:px-8"
      style={{ background: "linear-gradient(170deg, #1a1008 0%, #0f0a05 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/[0.07]">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/app/icon.png"
                alt="Handygo logo"
                width={36}
                height={36}
                className="rounded-xl object-contain"
              />
              <span className="text-white font-bold text-xl tracking-tight">Handygo</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              On-demand home repair and service booking, built for fast jobs,
              clear communication, and trusted local workers.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-600 mb-4">Product</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/delete-account" className="hover:text-white transition-colors">Delete Account</Link>
              </li>
            </ul>
          </div>

          {/* Support + availability */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-600 mb-4">Support</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@handygo.ai"
                  className="hover:text-white transition-colors"
                >
                  support@handygo.ai
                </a>
              </li>
            </ul>

            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-600 mt-8 mb-4">Availability</p>
            <div className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#DB6234" }}
              />
              <span>Coming soon on Google Play</span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-700">
          <span>&copy; {new Date().getFullYear()} Handygo. All rights reserved.</span>
          <span>handygo.ai</span>
        </div>
      </div>
    </footer>
  );
}
