import express, { Express } from "express";
import 'module-alias/register';
import dotenv from "../node_modules/dotenv";
import { applicationServer } from "./app";

const app: Express = express();

dotenv.config({
  path: `.env.${process.env.NODE_ENV?.trim()}`
});

try {
  applicationServer.run(app);
}catch (e: any) {
  // handleRuntimeError(app, e);
}

/*app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port} for environment ${process.env.NODE_ENV}!`);
});*/