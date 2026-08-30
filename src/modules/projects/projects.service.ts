import { prisma } from "../../lib/prisma";
import { generateSecretKey, sha256, encryptRawEvent } from "../../utils/crypto";

/**
 * Crée un projet et génère ses identifiants d'intégration.
 * IMPORTANT : la clé API et le webhook secret en clair ne sont retournés
 * qu'une seule fois, à la création — jamais récupérables ensuite (section 6.1
 * et 6.6 de la checklist PAYNEX, reprise ici : "conservez cette clé uniquement
 * sur votre serveur").
 */
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
    apiKey, // affiché une seule fois — le frontend doit avertir l'utilisateur de le copier maintenant
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

/** Vérifie qu'un projet appartient bien au marchand authentifié — sécurité multi-tenant de base. */
export async function assertProjectOwnership(projectId: string, merchantId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, merchantId } });
  if (!project) {
    const err = new Error("Projet introuvable ou non autorisé.");
    (err as any).statusCode = 404;
    throw err;
  }
  return project;
}
