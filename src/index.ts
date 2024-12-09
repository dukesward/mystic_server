import express, { Express } from "express";
import 'module-alias/register';
import dotenv from "../node_modules/dotenv";
import { ApplicationContext, ApplicationContextFactory, ApplicationServer } from "@core/application";
import { RuntimeApplicationContextFactory } from "@applications/bootstrap/factories";

const app: Express = express();
const contextFactory: ApplicationContextFactory = new RuntimeApplicationContextFactory();

const applicationContextGlobal: ApplicationContext = contextFactory.createContext();

dotenv.config({
  path: `.env.${process.env.NODE_ENV?.trim()}`
});

try {
  new ApplicationServer().run(app, contextFactory);
}catch (e: any) {
  // handleRuntimeError(app, e);
}

/*app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port} for environment ${process.env.NODE_ENV}!`);
});*/

export {
  applicationContextGlobal
}