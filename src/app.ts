import { RuntimeApplicationContextFactory } from "@applications/bootstrap/factories";
import { ApplicationServer } from "@core/application";

// this is a pure customer defined process and will only be used for app startup
const contextFactory = new RuntimeApplicationContextFactory();
const applicationContextGlobal = contextFactory.createContext();
const applicationServer = new ApplicationServer(contextFactory);

export {
  applicationContextGlobal,
  applicationServer
}