import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./common/logger/logger";
import { userRouter } from "./modules/user";
import { errorHandler } from "./common/middleware/error.middleware";
import { httpLogger } from "./common/middleware/http-logger.middleware";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/users", userRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started");
});
