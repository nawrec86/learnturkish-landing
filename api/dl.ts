// api/dl.ts
// learnturkishai.com/dl — Cihaz algılayan App Store / Play Store yönlendirme
// (Vercel Node serverless function. /dl URL'i vercel.json rewrite ile bu handler'a gider.)
//
// Çalışma:
//   /dl                    → cihaza göre store
//   /dl?src=poster_tr      → +UTM tracking (poster TR'den geldi)
//   /dl?src=poster_en      → +UTM tracking (poster EN'den geldi)
//   /dl?src=website        → +UTM tracking (website'den geldi)
//
// Masaüstü → fallback olarak '/' (henüz /download sayfası yok)

const APP_STORE_URL = 'https://apps.apple.com/tr/app/learnturkish-ai/id6761277846';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.nawrec86.learnturkishai';
const DESKTOP_FALLBACK = '/';

export default function handler(req: any, res: any) {
  const ua: string = (req.headers && req.headers['user-agent']) || '';
  const src: string = (req.query && typeof req.query.src === 'string' && req.query.src) || 'direct';

  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  const utmParams = new URLSearchParams({
    utm_source: src,
    utm_medium: src.startsWith('poster_') ? 'poster' : 'web',
    utm_campaign: 'app_download',
  });

  let redirectUrl: string;

  if (isIOS) {
    redirectUrl = `${APP_STORE_URL}?ct=${encodeURIComponent(src)}`;
  } else if (isAndroid) {
    const referrer = encodeURIComponent(utmParams.toString());
    redirectUrl = `${PLAY_STORE_URL}&referrer=${referrer}`;
  } else {
    redirectUrl = `${DESKTOP_FALLBACK}?${utmParams.toString()}`;
  }

  res.statusCode = 302;
  res.setHeader('Location', redirectUrl);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
}
