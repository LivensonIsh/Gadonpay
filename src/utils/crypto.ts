import crypto from "crypto";
import { nanoid } from "nanoid";

/**
 * Génère une clé secrète lisible (API_KEY, WEBHOOK_SECRET, token Gateway).
 * Le préfixe permet d'identifier visuellement le type de clé dans les logs
 * sans jamais exposer la valeur complète.
 */
export function generateSecretKey(prefix: string): string {
  return `${prefix}_${nanoid(40)}`;
}

/** Hash SHA-256 — utilisé pour stocker api_key / webhook_secret / gateway token en base
 *  (jamais la valeur en clair : si la DB fuit, les clés restent inutilisables). */
export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Signature HMAC-SHA256 d'un payload webhook avec le WEBHOOK_SECRET du projet. */
export function signWebhookPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Chiffrement symétrique AES-256-GCM du SMS brut avant stockage (section 5.1 de la spec).
 * NB : en production, la clé maître (MASTER_ENCRYPTION_KEY) doit venir d'un coffre-fort
 * de secrets (KMS/Vault), pas d'une variable d'env en clair sur le serveur applicatif.
 */
const MASTER_KEY = crypto
  .createHash("sha256")
  .update(process.env.MASTER_ENCRYPTION_KEY ?? "dev-only-insecure-key-change-me")
  .digest();

export function encryptRawEvent(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // format stocké : iv:authTag:ciphertext (tous en hex)
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decryptRawEvent(stored: string): string {
  const [ivHex, authTagHex, dataHex] = stored.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    MASTER_KEY,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
