export function TelegramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#29A9EB" />
      <path
        d="M5.5 11.9l11-4.2c.6-.2 1.1.2.9.9l-1.9 8.9c-.1.6-.6.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.4.3-.7.3l.3-3 5.4-4.9c.2-.2 0-.3-.3-.2l-6.7 4.2-2.9-.9c-.6-.2-.6-.6.5-.8z"
        fill="#fff"
      />
    </svg>
  );
}

export function VkIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#0077FF" />
      <path
        d="M12.6 16.7c-4.4 0-7-3.1-7.1-8.2h2.2c.1 3.8 1.8 5.4 3.1 5.7V8.5h2.1v3.2c1.3-.1 2.6-1.6 3.1-3.2h2.1c-.3 2-1.7 3.4-2.7 4 1 .5 2.6 1.8 3.2 4.2h-2.3c-.5-1.5-1.7-2.7-3.3-2.9v2.9h-.4z"
        fill="#fff"
      />
    </svg>
  );
}

export function OzonIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#005BFF" />
      <path
        d="M20 50 C 20 30, 80 30, 80 50 C 80 70, 20 70, 20 50 Z"
        fill="#F91155"
      />
      <circle cx="50" cy="50" r="15" fill="#fff" />
    </svg>
  );
}
