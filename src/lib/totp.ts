import { OTP } from "otplib";
import QRCode from "qrcode";

const otp = new OTP({ strategy: "totp" });

export function generateTotpSecret() {
  return otp.generateSecret();
}

export async function verifyTotpToken(token: string, secret: string) {
  const result = await otp.verify({ secret, token, epochTolerance: 30 });
  return result.valid;
}

export function buildTotpUri(email: string, secret: string) {
  return otp.generateURI({ issuer: "AGENTUR-OS", label: email, secret });
}

export async function totpQrCodeDataUrl(email: string, secret: string) {
  return QRCode.toDataURL(buildTotpUri(email, secret));
}
