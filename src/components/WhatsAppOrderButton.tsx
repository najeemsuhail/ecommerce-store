'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

type WhatsAppOrderButtonProps = {
  message: string;
  label: string;
  className?: string;
  unavailableLabel?: string;
};

export default function WhatsAppOrderButton({
  message,
  label,
  className = '',
  unavailableLabel = 'WhatsApp unavailable',
}: WhatsAppOrderButtonProps) {
  const { contactPhone } = useStoreSettings();
  const href = buildWhatsAppUrl(contactPhone, message);

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-500 ${className}`}
        title="Add a store contact phone number to enable WhatsApp orders."
      >
        <FontAwesomeIcon icon={faWhatsapp} className="h-5 w-5" />
        <span>{unavailableLabel}</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#25D366] bg-white px-4 py-3 font-semibold text-[#128C4A] transition hover:bg-[#f1fff6] ${className}`}
    >
      <FontAwesomeIcon icon={faWhatsapp} className="h-5 w-5" />
      <span>{label}</span>
    </a>
  );
}
