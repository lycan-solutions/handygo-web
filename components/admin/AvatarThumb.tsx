const initials = (firstName: string, lastName: string) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

type AvatarThumbProps = {
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES: Record<NonNullable<AvatarThumbProps["size"]>, string> = {
  sm: "w-9 h-9 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-20 h-20 text-2xl",
};

const AvatarThumb = ({ avatarUrl, firstName, lastName, size = "md" }: AvatarThumbProps) => {
  const sizeClass = SIZE_CLASSES[size];
  const fallback = (
    <div
      className={`${sizeClass} rounded-full bg-orange-100 text-[var(--brand)] font-bold flex items-center justify-center shrink-0`}
    >
      {initials(firstName, lastName)}
    </div>
  );

  if (!avatarUrl) return fallback;

  return (
    <span className={`relative inline-block ${sizeClass} shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClass} rounded-full object-cover absolute inset-0`}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          e.currentTarget.nextElementSibling?.classList.remove("hidden");
        }}
      />
      <span className="hidden absolute inset-0">{fallback}</span>
    </span>
  );
};

export default AvatarThumb;
