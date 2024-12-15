import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import path from "path";
import { error } from "console";
import { checkSessionIdRExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app:FastifyInstance) {

  app.get("/", {preHandler: [checkSessionIdRExists]}, async (request) => {
    const {sessionId} = request.cookies;
    const transactions = await knex("transactions")
    .where({ session_id: sessionId })
    .select();

    return { transactions };
  });

  app.get("/summary", async (request) => {

    const {sessionId} = request.cookies;
    const summary = await knex("transactions")
    .where({ session_id: sessionId })
    .sum("amount", { as: "amount" })
    .first();

    return { summary };
  });

  app.get("/:id", {preHandler: [checkSessionIdRExists]}, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);
    const {sessionId} = request.cookies;

    const transaction = await knex("transactions")
    .where({
      id,
      session_id : sessionId
    })
    .first();

    return { transaction };
  });

  app.post("/", async (request, reply) => {
    const creatTrasnsactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    const {title, amount, type} = creatTrasnsactionBodySchema.parse(request.body);

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}