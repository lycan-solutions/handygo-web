import {
  APP_STORE_URL,
  IOS_COMING_SOON,
  PLAY_STORE_URL,
} from "@/lib/handygo-app-links";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3 18.5v-13A1.5 1.5 0 0 1 4.914 4.1l12.5 6.5a1.5 1.5 0 0 1 0 2.8l-12.5 6.5A1.5 1.5 0 0 1 3 18.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16.365 1.43c0 1.14-.462 2.05-1.04 2.72-.628.72-1.646 1.28-2.6 1.2-.12-1.1.45-2.24 1.03-2.9.63-.72 1.72-1.24 2.61-1.02zM20.5 17.03c-.32.74-.7 1.44-1.16 2.1-.63.9-1.15 1.53-1.55 1.87-.63.58-1.3.87-2.03.89-.52 0-1.14-.15-1.86-.45-.72-.3-1.38-.44-2-.44-.65 0-1.33.15-2.06.44-.72.3-1.31.46-1.77.47-.7.03-1.39-.27-2.06-.9-.44-.38-1-1.04-1.66-1.98-.72-1-1.3-2.18-1.75-3.52-.48-1.44-.72-2.83-.72-4.18 0-1.55.33-2.88 1-4 .52-.9 1.22-1.62 2.08-2.14a5.35 5.35 0 0 1 2.82-.83c.55 0 1.28.18 2.2.53.9.35 1.48.53 1.73.53.19 0 .82-.2 1.9-.6 1-.37 1.85-.53 2.55-.47 1.88.15 3.3.9 4.24 2.24-1.68 1.02-2.51 2.44-2.5 4.27.02 1.43.53 2.62 1.53 3.57.46.44.97.78 1.53 1.02-.12.36-.25.71-.4 1.05z" />
    </svg>
  );
}

export default function AppDownloadButtons({
  className = "",
}: {
  className?: string;
}) {
  const iosHref = !IOS_COMING_SOON && APP_STORE_URL ? APP_STORE_URL : null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-white text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: "#DB6234" }}
      >
        <PlayIcon />
        Get it on Google Play
      </a>

      {iosHref ? (
        <a
          href={iosHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-zinc-900 border border-zinc-200 text-sm hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
        >
          <AppleIcon />
          Download on the App Store
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-zinc-400 border border-zinc-200 text-sm cursor-not-allowed select-none bg-zinc-50"
        >
          <AppleIcon />
          iOS — Coming Soon
        </span>
      )}
    </div>
  );
}
