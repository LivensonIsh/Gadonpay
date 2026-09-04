import { prisma } from "../../lib/prisma";
import { generateSecretKey, sha256, encryptRawEvent } from "../../utils/crypto";

export async function createProject(merchantId: string, name: string) {
  const apiKey = generateSecretKey("gp_live");
  const webhookSecret = generateSecretKey("whsec");

  const project = await prisma.project.create({
    data: {
      merchantId,
      name,
      apiKeyHash: sha256(apiKey),
      apiKeyPrefix: apiKey.slice(0, 12),
      webhookSecretEncrypted: encryptRawEvent(webhookSecret),
    },
  });

  return {
    id: project.id,
    name: project.name,
    apiKey,
    webhookSecret,
    createdAt: project.createdAt,
  };
}

export async function listProjects(merchantId: string) {
  const projects = await prisma.project.findMany({
    where: { merchantId },
    select: { id: true, name: true, apiKeyPrefix: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return projects;
}

export async function assertProjectOwnership(projectId: string, merchantId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, merchantId } });
  if (!project) {
    const err = new Error("Projet introuvable ou non autorisé.");
    (err as any).statusCode = 404;
    throw err;
  }
  return project;
}

export async function renameProject(projectId: string, merchantId: string, name: string) {
  await assertProjectOwnership(projectId, merchantId);
  const project = await prisma.project.update({ where: { id: projectId }, data: { name } });
  return { id: project.id, name: project.name };
}

export async function regenerateApiKey(projectId: string, merchantId: string) {
  await assertProjectOwnership(projectId, merchantId);
  const apiKey = generateSecretKey("gp_live");
  await prisma.project.update({
    where: { id: projectId },
    data: { apiKeyHash: sha256(apiKey), apiKeyPrefix: apiKey.slice(0, 12) },
  });
  return apiKey;
}

export async function regenerateWebhookSecret(projectId: string, merchantId: string) {
  await assertProjectOwnership(projectId, merchantId);
  const webhookSecret = generateSecretKey("whsec");
  await prisma.project.update({
    where: { id: projectId },
    data: { webhookSecretEncrypted: encryptRawEvent(webhookSecret) },
  });
  return webhookSecret;
}
