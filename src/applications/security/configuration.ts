import { DefaultSecurityFilterChain } from "./filters";
import { HttpSecurity } from "./http_security";

const httpSecurity = [
  {object: HttpSecurity}
]

const securityFilterChain = [
  {object: DefaultSecurityFilterChain}
]

export {
  httpSecurity,
  securityFilterChain
}