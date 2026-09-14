import { MessageCircle } from 'lucide-react';

import { whatsappHref } from '@/lib/utils';

export function WhatsAppFloatButton({ phone, businessName }: { phone?: string | null; businessName: string }) {
  const href = whatsappHref(phone, `Hello, I'd like to get in touch about ${businessName}`);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-105"
      aria-label={`Message ${businessName} on WhatsApp`}
    >
      <MessageCircle className="h-6 w-6" fill="white" />
    </a>
  );
}
