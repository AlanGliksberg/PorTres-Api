import { RequestHandler } from "express";

const APPLE_STORE_URL = "https://apps.apple.com/app/6753603778";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.portres.porTres";

export const getStoreUrlForUserAgent = (userAgent: string) => {
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  if (isIOS && APPLE_STORE_URL) return APPLE_STORE_URL;
  if (isAndroid && PLAY_STORE_URL) return PLAY_STORE_URL;
  return null;
};

export const buildStoreDownloadHtml = () => {
  const appleLink = APPLE_STORE_URL
    ? `<a href="${APPLE_STORE_URL}" style="text-decoration:none;"><button style="padding:12px 16px;margin:8px;border-radius:8px;border:1px solid #0a84ff;background:#0a84ff;color:#fff;font-size:16px;cursor:pointer;">Abrir en App Store</button></a>`
    : "";
  const playLink = PLAY_STORE_URL
    ? `<a href="${PLAY_STORE_URL}" style="text-decoration:none;"><button style="padding:12px 16px;margin:8px;border-radius:8px;border:1px solid #34a853;background:#34a853;color:#fff;font-size:16px;cursor:pointer;">Abrir en Play Store</button></a>`
    : "";

  return `<!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Descargar app</title>
      </head>
      <body style="font-family: Arial, sans-serif; background: #f5f7fb; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:16px;">
        <div style="background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.08); padding:24px; max-width:420px; width:100%; text-align:center;">
          <h1 style="margin:0 0 8px; font-size:22px; color:#111;">Descargá la app</h1>
          <p style="margin:0 0 16px; color:#444; font-size:15px;">Elegí tu tienda.</p>
          <div style="display:flex; flex-direction:column; align-items:center;">
            ${appleLink}
            ${playLink}
          </div>
        </div>
      </body>
    </html>`;
};

export const redirectToStore: RequestHandler = (req, res) => {
  const userAgent = (req.headers["user-agent"] || "").toString();
  const target = getStoreUrlForUserAgent(userAgent);

  if (target) {
    res.redirect(target);
    return;
  }

  res.status(200).send(buildStoreDownloadHtml());
  return;
};
