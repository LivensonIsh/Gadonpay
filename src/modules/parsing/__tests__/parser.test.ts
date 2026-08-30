import { describe, it, expect } from "vitest";
import { parseSms } from "../parser.service";
import { Provider, TransactionType } from "@prisma/client";

describe("parseSms — NatCash", () => {
  it("parse un encaissement FR (transfert entrant avec code agent)", () => {
    const sms =
      "Vous avez encaisse 2,000 HTG a 21:55 28/08/2026 de ROSEMARTINE NOEL, code 248905. Votre solde: 2,000.51 HTG. TransCode: 26082822709490. Merci";

    const result = parseSms(Provider.NATCASH, sms);

    expect(result.type).toBe(TransactionType.INCOMING_TRANSFER);
    expect(result.amount).toBe(2000);
    expect(result.sender).toBe("ROSEMARTINE NOEL");
    expect(result.balanceAfter).toBe(2000.51);
    expect(result.transactionId).toBe("26082822709490");
    expect(result.operatorTimestamp?.toISOString()).toContain("2026-08-29"); // 21:55 -05:00 → 29 en UTC
  });

  it("parse une réception générique (ex. Tranzmit)", () => {
    const sms =
      "Vous avez recu 3,066.81 HTG de Tranzmit a 16:20 16/07/2026. Titre : IDTII - BR10203650826368. Votre solde : 3,081.01 HTG. Code de transaction : 26071630168985.";

    const result = parseSms(Provider.NATCASH, sms);

    expect(result.type).toBe(TransactionType.INCOMING_TRANSFER);
    expect(result.amount).toBeCloseTo(3066.81);
    expect(result.transactionId).toBe("26071630168985");
  });

  it("parse un transfert sortant EN sans le classer comme paiement reçu", () => {
    const sms =
      "You transferred 1,015 HTG to LERICHE LUDNER 33428479 at 16:14 12/07/2026, fee: 17.5 HTG. Your balance: 14.2 HTG. TransCode: 26071222422499. Thank you";

    const result = parseSms(Provider.NATCASH, sms);

    // Un sortant ne doit jamais être éligible au matching de paiement
    expect(result.type).not.toBe(TransactionType.INCOMING_TRANSFER);
    expect(result.amount).toBe(1015);
    expect(result.fee).toBe(17.5);
  });

  it("parse une alerte de solde sans montant de transaction", () => {
    const sms = "Votre solde: 0.51 HTG a 12:11 23/07/2026. TransCode: 26072343530765. Merci";

    const result = parseSms(Provider.NATCASH, sms);

    expect(result.type).toBe(TransactionType.BALANCE_CHECK);
    expect(result.balanceAfter).toBe(0.51);
    expect(result.amount).toBeNull();
  });

  it("détecte un OTP et ne lui attribue jamais de transactionId exploitable", () => {
    const sms = "OTP est 205036. Rentrer otp.";

    const result = parseSms(Provider.NATCASH, sms);

    expect(result.type).toBe(TransactionType.OTP);
    expect(result.transactionId).toBeNull();
    expect(result.amount).toBeNull();
  });

  it("renvoie UNKNOWN pour un texte qui ne correspond à aucun format connu", () => {
    const result = parseSms(Provider.NATCASH, "Ceci n'est pas un SMS NatCash reconnu.");
    expect(result.type).toBe(TransactionType.UNKNOWN);
  });
});
