import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { AuthError } from "./auth.service";

export async function getProfile(merchantId: string) {
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
  return {
    id: merchant.id,
    name: merchant.name,
    email: merchant.email,
    address: merchant.address,
    department: merchant.department,
    phoneNumber: merchant.phoneNumber,
    status: merchant.status,
    emailVerifiedAt: merchant.emailVerifiedAt,
    phoneVerifiedAt: merchant.phoneVerifiedAt,
    createdAt: merchant.createdAt,
  };
}

export async function updateProfile(merchantId: string, data: { name?: string; address?: string; department?: string; phoneNumber?: string }) {
  await prisma.merchant.update({ where: { id: merchantId }, data });
  return getProfile(merchantId);
}

export async function changePassword(merchantId: string, currentPassword: string, newPassword: string) {
  const merchant = await prisma.merchant.findUniqueOrThrow({ where: { id: merchantId } });
  const valid = await bcrypt.compare(currentPassword, merchant.passwordHash);
  if (!valid) throw new AuthError("Mot de passe actuel incorrect.", 401);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.merchant.update({ where: { id: merchantId }, data: { passwordHash } });
}
