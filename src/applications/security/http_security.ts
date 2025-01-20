import { FilterChain } from "../bootstrap/filters";
import { DefaultSecurityFilterChain } from "./filters";

class HttpSecurity {
  constructor() {
    
  }
  build(): FilterChain {
    let filterChain: FilterChain = new DefaultSecurityFilterChain();
    return filterChain;
  }
}

export {
  HttpSecurity
}