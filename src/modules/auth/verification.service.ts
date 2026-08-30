import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { sha256 } from "../../utils/crypto";
import { emailProvider } from "../../lib/notifications/email.provider";
import { smsProvider } from "../../lib/notifications/sms.provider";
import { AuthError } from "./auth.service";

const CODE_TTL_MINUTES = 15;

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function sendEmailVerification(merchantId: string) {
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
  if (merchant.emailVerifiedAt) {
    throw new AuthError("Email déjà vérifié.", 409);
  }

  const code = generateCode();
  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      emailVerificationCodeHash: sha256(code),
      emailVerificationExpiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  await emailProvider.send(
    merchant.email,
    "Vérifiez votre adresse email GadonPay",
    `Votre code de vérification est : ${code} (valable ${CODE_TTL_MINUTES} minutes).`
  );
}

export async function confirmEmailVerification(merchantId: string, code: string) {
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });

  if (
    !merchant.emailVerificationCodeHash ||
    !merchant.emailVerificationExpiresAt ||
    merchant.emailVerificationExpiresAt < new Date()
  ) {
    throw new AuthError("Code expiré ou inexistant, redemandez-en un.", 400);
  }

  if (sha256(code) !== merchant.emailVerificationCodeHash) {
    throw new AuthError("Code incorrect.", 400);
  }

  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      emailVerifiedAt: new Date(),
      emailVerificationCodeHash: null,
      emailVerificationExpiresAt: null,
    },
  });
}

export async function sendPhoneVerification(merchantId: string) {
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
  if (merchant.phoneVerifiedAt) {
    throw new AuthError("Téléphone déjà vérifié.", 409);
  }

  const code = generateCode();
  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      phoneVerificationCodeHash: sha256(code),
      phoneVerificationExpiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  await smsProvider.send(
    `+${merchant.phoneNumber}`,
    `GadonPay : votre code de vérification est ${code} (valable ${CODE_TTL_MINUTES} min).`
  );
}

export async function confirmPhoneVerification(merchantId: string, code: string) {
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });

  if (
    !merchant.phoneVerificationCodeHash ||
    !merchant.phoneVerificationExpiresAt ||
    merchant.phoneVerificationExpiresAt < new Date()
  ) {
    throw new AuthError("Code expiré ou inexistant, redemandez-en un.", 400);
  }

  if (sha256(code) !== merchant.phoneVerificationCodeHash) {
    throw new AuthError("Code incorrect.", 400);
  }

  await prisma.merchant.update({
    where: { id: merchantId },
    data: {
      phoneVerifiedAt: new Date(),
      phoneVerificationCodeHash: null,
      phoneVerificationExpiresAt: null,
    },
  });
}
