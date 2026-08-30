import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import type { RegisterInput, LoginInput } from "./auth.schemas";

export class AuthError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("509") ? digits : `509${digits}`;
}

export async function registerMerchant(input: RegisterInput) {
  const existing = await prisma.merchant.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError("Un compte existe déjà avec cet email.", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const merchant = await prisma.merchant.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      address: input.address,
      department: input.department,
      phoneNumber: normalizePhone(input.phoneNumber),
    },
  });

  // NOTE Phase 1 : envoyer ici un email/SMS de vérification réel (hors scope MVP backend pur).
  // phoneVerifiedAt / emailVerifiedAt restent null jusqu'à vérification effective.

  return sanitizeMerchant(merchant);
}

export async function loginMerchant(input: LoginInput) {
  const merchant = await prisma.merchant.findUnique({ where: { email: input.email } });
  if (!merchant) {
    throw new AuthError("Email ou mot de passe incorrect.", 401);
  }

  if (merchant.status === "SUSPENDED") {
    throw new AuthError("Ce compte a été suspendu. Contactez le support GadonPay.", 403);
  }

  const valid = await bcrypt.compare(input.password, merchant.passwordHash);
  if (!valid) {
    throw new AuthError("Email ou mot de passe incorrect.", 401);
  }

  const token = jwt.sign(
    { sub: merchant.id, type: "merchant" },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  return { token, merchant: sanitizeMerchant(merchant) };
}

// Ne jamais renvoyer passwordHash au client, sous aucun prétexte.
function sanitizeMerchant(merchant: {
  id: string;
  name: string;
  email: string;
  address: string;
  department: string;
  phoneNumber: string;
  status: string;
  createdAt: Date;
}) {
  const { id, name, email, address, department, phoneNumber, status, createdAt } = merchant;
  return { id, name, email, address, department, phoneNumber, status, createdAt };
}
