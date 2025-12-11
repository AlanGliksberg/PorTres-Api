import { Request, Response } from "express";
import { getStoreUrlForUserAgent } from "../store/store.controller";

export const redirectToMatchLink = (req: Request, res: Response) => {
  const matchId = req.params.id;

  const deepLink = `portres://match/${matchId}`;
  const userAgent = (req.headers["user-agent"] || "").toString();
  const fallback = getStoreUrlForUserAgent(userAgent) ?? "/download";

  res.status(200).send(`<!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Abrir partido</title>
        <script>
          (function() {
            var deepLink = "${deepLink}";
            var fallback = "${fallback}";
            window.location.href = deepLink;
            setTimeout(function() {
              window.location.href = fallback;
            }, 1200);
          })();
        </script>
      </head>
      <body style="font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh;">
        <p style="color:#555; font-size:15px;">Redirigiendo...</p>
      </body>
    </html>`);
};
