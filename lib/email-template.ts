import type { BrandConfig } from "@prisma/client";
import { SALON } from "./brand";

export type EmailContent = {
  subject: string;
  preheader: string;
  headline: string;
  paragraphs: string[];
  ctaText: string;
};

export function buildEmailHtml(content: EmailContent, brand: BrandConfig): string {
  const paragraphsHtml = content.paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#3a352c;">${p}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${content.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:${brand.colorPrimary};font-family:${brand.fontBody}, Arial, sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${content.preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${brand.colorPrimary};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background-color:${brand.colorSecondary}22;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-family:${brand.fontHeading}, Georgia, serif;font-size:22px;letter-spacing:0.06em;color:#2c2822;">${SALON.name}</p>
              <p style="margin:4px 0 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#7a7266;">${SALON.claim}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="margin:0 0 18px;font-family:${brand.fontHeading}, Georgia, serif;font-weight:500;font-size:26px;color:#2c2822;">${content.headline}</h1>
              ${paragraphsHtml}
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                <tr>
                  <td style="border-radius:10px;background-color:${brand.colorAccent};">
                    <a href="${brand.setmoreUrl}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#2c2822;text-decoration:none;">${content.ctaText}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:${brand.colorPrimary};text-align:center;">
              <p style="margin:0;font-size:12px;color:#7a7266;">${SALON.name} · ${SALON.address}</p>
              <p style="margin:6px 0 0;font-size:11px;color:#a39b8c;">Du erhältst diese E-Mail, weil du dich für Neuigkeiten von MIRRA WELLNESS angemeldet hast.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailToPlainText(content: EmailContent, brand: BrandConfig): string {
  return `${content.headline}\n\n${content.paragraphs.join("\n\n")}\n\n${content.ctaText}: ${brand.setmoreUrl}\n\n${SALON.name} · ${SALON.address}`;
}
