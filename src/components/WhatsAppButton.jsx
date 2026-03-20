import { FACEBOOK_URL, INSTAGRAM_URL, WHATSAPP_NUMBER, YOUTUBE_URL } from '../config'
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {[
        { label: 'Instagram', href: INSTAGRAM_URL, bg: 'bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400' },
        { label: 'Facebook', href: FACEBOOK_URL, bg: 'bg-[#1877F2]' },
        { label: 'YouTube', href: YOUTUBE_URL, bg: 'bg-[#FF0000]' },
      ].map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-touch flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-110 ${social.bg}`}
          aria-label={social.label}
        >
          {social.label === 'Instagram' && (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Zm5.25-2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
            </svg>
          )}
          {social.label === 'Facebook' && (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.5 22v-8h2.7l.5-3h-3.2V9.2c0-.9.4-1.7 1.9-1.7H17V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.4V11H7.5v3h2.8v8h3.2Z" />
            </svg>
          )}
          {social.label === 'YouTube' && (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23 12c0 2.5-.3 4.1-.5 4.8-.2.8-.8 1.4-1.6 1.6-.8.2-2.8.6-8.9.6s-8.1-.4-8.9-.6c-.8-.2-1.4-.8-1.6-1.6C1.3 16.1 1 14.5 1 12s.3-4.1.5-4.8c.2-.8.8-1.4 1.6-1.6C3.9 5.4 5.9 5 12 5s8.1.4 8.9.6c.8.2 1.4.8 1.6 1.6.2.7.5 2.3.5 4.8Zm-13.5-3.2v6.4L15.8 12 9.5 8.8Z" />
            </svg>
          )}
          <span className="sr-only">{social.label}</span>
        </a>
      ))}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-touch flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}
