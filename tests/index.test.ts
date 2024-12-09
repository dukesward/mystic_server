import 'module-alias/register';
import { StandardConfigDataResolver } from "../src/applications/bootstrap/config";
import { ConfigDataResolver } from "../src/core/config";
import { AppLogger } from "../src/core/logger";

let configResolver: StandardConfigDataResolver = new StandardConfigDataResolver();

AppLogger.debug(configResolver.getBinder());