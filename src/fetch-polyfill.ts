import fetch, { Headers, Request, Response } from "node-fetch";

if (globalThis.fetch === undefined) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}
