import { z } from "zod";

// Les 10 départements d'Haïti — liste fermée, section 11.1 de la spec.
// Volontairement un enum, pas un champ texte libre, pour fiabiliser les données.
export const DEPARTMENTS = [
  "ARTIBONITE",
  "CENTRE",
  "GRAND_ANSE",
  "NIPPES",
  "NORD",
  "NORD_EST",
  "NORD_OUEST",
  "OUEST",
  "SUD",
  "SUD_EST",
] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120),
  email: z.string().trim().toLowerCase().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128),
  address: z.string().trim().min(4, "Adresse trop courte").max(255),
  department: z.enum(DEPARTMENTS, {
    errorMap: () => ({ message: "Département invalide (10 départements d'Haïti)" }),
  }),
  // Numéro haïtien : 8 chiffres locaux, avec ou sans indicatif 509
  phoneNumber: z
    .string()
    .trim()
    .regex(/^(509)?[0-9]{8}$/, "Numéro de téléphone haïtien invalide (8 chiffres)"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
