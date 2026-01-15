import "dotenv/config"
import express from "express"
import cors from "cors"
import { ApolloServer } from "@apollo/server"
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs"
import { expressMiddleware } from "@as-integrations/express5"
import bodyParser from "body-parser"
import { print, type DocumentNode } from "graphql"
import typeDefs from "./schema/typeDefs.js"
import resolvers from "./schema/resolvers/index.js"
import { buildContext } from "./lib/context.js"
import { initializeEmailService } from "./lib/email/emailService.js"
import { initializeBookingReminderScheduler } from "./schedulers/bookingReminderScheduler.js"

const app = express()
const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: false,
})

await server.start()

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const normalizeGraphQLBody: express.RequestHandler = (req, _res, next) => {
  const normalizeEntry = (entry: Record<string, unknown>) => {
    if (typeof entry.variables === "string") {
      try {
        entry.variables = JSON.parse(entry.variables)
      } catch {
      }
    }

    if (typeof entry.extensions === "string") {
      try {
        entry.extensions = JSON.parse(entry.extensions)
      } catch {
      }
    }

    if (entry.query && typeof entry.query === "object") {
      console.log("Query payload type:", (entry.query as { kind?: string }).kind)
    }
    if (entry.query && typeof entry.query === "object" && (entry.query as DocumentNode).kind === "Document") {
      try {
        entry.query = print(entry.query as DocumentNode)
      } catch {
      }
    }
  }

  if (Array.isArray(req.body)) {
    req.body.forEach((payload) => {
      if (payload && typeof payload === "object") {
        normalizeEntry(payload as Record<string, unknown>)
      }
    })
  } else if (req.body && typeof req.body === "object") {
    normalizeEntry(req.body as Record<string, unknown>)
  }

  next()
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

app.use(
  "/graphql",
  graphqlUploadExpress({
    maxFileSize: 50 * 1024 * 1024,
    maxFiles: 10,
  }),
  bodyParser.json({
    limit: "50mb",
    type: ["application/json", "text/plain"],
  }),
  express.urlencoded({ limit: "50mb", extended: true }),
  normalizeGraphQLBody,
  expressMiddleware(server, {
    context: async ({ req }) => buildContext(req),
  })
)

const port = process.env.PORT || 4000

initializeEmailService()

initializeBookingReminderScheduler()

app.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}/graphql`)
})
