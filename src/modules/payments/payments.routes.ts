import { Router } from "express";
import { apiKeyAuth, ApiKeyAuthedRequest } from "../../middleware/apiKeyAuth";
import { createPaymentSchema } from "./payments.schemas";
import { createPayment, getPayment, listPayments, PaymentError } from "./payments.service";

export const paymentsRouter = Router();
paymentsRouter.use(apiKeyAuth);

paymentsRouter.post("/", async (req: ApiKeyAuthedRequest, res, next) => {
  try {
    const idempotencyKey = req.header("Idempotency-Key");
    if (!idempotencyKey) {
      return res.status(400).json({ ok: false, error: "IDEMPOTENCY_KEY_REQUIRED" });
    }

    const body = createPaymentSchema.parse(req.body);

    const payment = await createPayment({
      projectId: req.projectId!,
      amount: body.amount,
      currency: body.currency,
      provider: body.provider,
      reference: body.reference,
      idempotencyKey,
    });

    res.status(201).json({
      ok: true,
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      reference: payment.reference,
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      return res.status(err.statusCode).json({ ok: false, error: err.code });
    }
    next(err);
  }
});

paymentsRouter.get("/:id", async (req: ApiKeyAuthedRequest, res, next) => {
  try {
    const payment = await getPayment(req.projectId!, req.params.id);
    res.json({
      ok: true,
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      reference: payment.reference,
      created_at: payment.createdAt,
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      return res.status(err.statusCode).json({ ok: false, error: err.code });
    }
    next(err);
  }
});

paymentsRouter.get("/", async (req: ApiKeyAuthedRequest, res, next) => {
  try {
    const payments = await listPayments(req.projectId!, {
      status: req.query.status as string | undefined,
      provider: req.query.provider as string | undefined,
    });
    res.json({ ok: true, payments });
  } catch (err) {
    next(err);
  }
});
