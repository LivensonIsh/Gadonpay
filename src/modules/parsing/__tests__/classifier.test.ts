import { describe, it, expect } from "vitest";
import { classifySms } from "../classifier.service";
import { TransactionType } from "@prisma/client";

describe("classifySms", () => {
  it("classe un OTP comme OTP, jamais comme paiement", () => {
    expect(classifySms("OTP est 205036. Rentrer otp.")).toBe(TransactionType.OTP);
  });

  it("classe un encaissement comme transfert entrant", () => {
    expect(
      classifySms(
        "Vous avez encaisse 2,000 HTG a 21:55 28/08/2026 de ROSEMARTINE NOEL, code 248905. TransCode: 26082822709490"
      )
    ).toBe(TransactionType.INCOMING_TRANSFER);
  });

  it("classe une alerte de solde comme BALANCE_CHECK, pas comme paiement", () => {
    expect(classifySms("Votre solde: 0.51 HTG a 12:11 23/07/2026. TransCode: 26072343530765. Merci")).toBe(
      TransactionType.BALANCE_CHECK
    );
  });

  it("ne classe jamais un message promo contenant un vrai TransCode comme promo", () => {
    // Sécurité : si un TransCode réel est présent, ne pas laisser un mot "bonus"
    // écraser une transaction potentiellement réelle.
    const sms = "Bonus reçu ! TransCode: 26082822709490";
    expect(classifySms(sms)).not.toBe(TransactionType.PROMO);
  });
});
