import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { sha256 } from "../../utils/crypto";
import { emailProvider } from "../../lib/notifications/email.provider";
import { env } from "../../config/env";
import { AuthError } from "./auth.service";

const RESET_TOKEN_TTL_MINUTES = 30;

export async function requestPasswordReset(email: string) {
  const merchant = await prisma.merchant.findUnique({ where: { email } });
  if (!merchant) return;

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      passwordResetTokenHash: sha256(token),
      passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    },
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  await emailProvider.send(
    merchant.email,
    "Réinitialisation de votre mot de passe GadonPay",
    `Cliquez sur ce lien pour choisir un nouveau mot de passe (valable ${RESET_TOKEN_TTL_MINUTES} minutes) : ${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`
  );
}

export async function resetPassword(token: string, newPassword: string) {
  const merchant = await prisma.merchant.findFirst({ where: { passwordResetTokenHash: sha256(token) } });
  if (!merchant || !merchant.passwordResetExpiresAt || merchant.passwordResetExpiresAt < new Date()) {
    throw new AuthError("Lien invalide ou expiré. Redemandez une réinitialisation.", 400);
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { passwordHash, passwordResetTokenHash: null, passwordResetExpiresAt: null },
  });
}
