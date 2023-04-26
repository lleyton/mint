import Script from 'next/script';

export default function PlausibleScript({ plausible }: { plausible?: PlausibleConfigInterface }) {
  if (!plausible?.domain || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script
      strategy="afterInteractive"
      data-domain={plausible.domain}
      src={plausible.script ?? 'https://plausible.io/js/script.js'}
    />
  );
}
