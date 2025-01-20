import { AppLoggerBuilder, Logger } from "@src/core/logger";
import { ApplicationFilterChain } from "../bootstrap/filters";

class DefaultSecurityFilterChain extends ApplicationFilterChain {
	private logger: Logger
	constructor() {
		super();
		this.logger = AppLoggerBuilder.build({instance: this});
	}
	doFilter(request: Request, response: Response): void {
		this.logger.info('FilterChain: doFilter called');
		super.doFilter(request, response);
	}
}

export {
	DefaultSecurityFilterChain
}