import type { ReactNode } from "react";

type RestaurantSocialLinksProps = {
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  whatsappUrl: string | null;
  locationUrl?: string | null;
  locationLabel?: string;
};

type SocialLinkItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect height="18" rx="5" stroke="currentColor" strokeWidth="1.75" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.2" cy="6.8" fill="currentColor" r="1.1" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 8.5V6.75c0-.69.56-1.25 1.25-1.25H17V3h-2.5C12.02 3 10.5 4.52 10.5 6.5V8.5H8v2.75h2.5V21h3.25v-9.75H16l.5-2.75H14z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16.5 3c.4 2.2 1.7 3.9 3.5 4.7V11c-1.8-.05-3.4-.55-4.8-1.4v6.1c0 3.2-2.6 5.8-5.8 5.8S3.6 19 3.6 15.8c0-3.1 2.4-5.6 5.5-5.8v3.1c-.9.2-1.6 1-1.6 1.9 0 1.1.9 2 2 2s2-.9 2-2V3h4z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3a8.5 8.5 0 0 0-7.3 12.8L3 21l5.4-1.6A8.5 8.5 0 1 0 12 3zm0 15.2c-1.3 0-2.5-.4-3.5-1l-.25-.15-3.2.95.95-3.1-.17-.27A6.4 6.4 0 1 1 18.4 12 6.4 6.4 0 0 1 12 18.2zm3.5-4.8c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.6.7-.7.8-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.7-1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3 0-.1 0-.2 0-.3 0-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.4c-.1 0-.3 0-.5.2-.2.2-.7.7-.7 1.7 0 1 .7 2 1 2.2.2.2 1.8 2.8 4.4 3.8.6.3 1.1.4 1.5.4.3 0 .9-.1 1.3-.6.3-.5 1.3-1.2 1.4-1.5.1-.3.1-.6 0-.7-.1-.1-.2-.1-.4-.2z" />
    </svg>
  );
}

export function RestaurantSocialLinks({
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  whatsappUrl,
  locationUrl,
  locationLabel = "Location",
}: RestaurantSocialLinksProps) {
  const items: SocialLinkItem[] = [];

  if (instagramUrl) {
    items.push({
      href: instagramUrl,
      label: "Instagram",
      icon: <InstagramIcon className="h-5 w-5" />,
    });
  }

  if (facebookUrl) {
    items.push({
      href: facebookUrl,
      label: "Facebook",
      icon: <FacebookIcon className="h-5 w-5" />,
    });
  }

  if (tiktokUrl) {
    items.push({
      href: tiktokUrl,
      label: "TikTok",
      icon: <TikTokIcon className="h-5 w-5" />,
    });
  }

  if (whatsappUrl) {
    items.push({
      href: whatsappUrl,
      label: "WhatsApp",
      icon: <WhatsAppIcon className="h-5 w-5" />,
    });
  }

  if (locationUrl) {
    items.push({
      href: locationUrl,
      label: locationLabel,
      icon: <LocationIcon className="h-5 w-5" />,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      {items.map((item) => (
        <a
          key={item.label}
          aria-label={item.label}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:scale-110 hover:border-amber-200 hover:text-amber-500"
          href={item.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {item.icon}
        </a>
      ))}
    </div>
  );
}
