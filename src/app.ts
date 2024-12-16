import fastify from "fastify";
import { knex } from "./database";
import { env } from "./env";
import { transactionsRoutes } from "./routes/transactions";
import fastifyCookie from "@fastify/cookie";

export const app = fastify();

app.register(fastifyCookie);
app.addHook("preHandler", async (request, reply) => {
  console.log(`[${request.method} ${request.url}]`);
});
app.register(transactionsRoutes, {
  prefix: "transactions",
});