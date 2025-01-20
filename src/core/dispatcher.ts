import { HttpRequest, HttpResponse } from "./http";

interface Dispatcher {
  dispatch(request: HttpRequest, response: HttpResponse): void;
}

export {
  Dispatcher
};