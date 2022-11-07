// deno-lint-ignore-file require-await
import type { Context } from "https://edge.netlify.com";

const allowMethods = "GET, OPTIONS";

function isAllowedOrign(str: string) {
  const allowedOrigins = ["saneef.static.observableusercontent.com"];
  return Boolean(
    allowedOrigins.find((s) => str.toLowerCase().includes(s.toLowerCase()))
  );
}

// CORS Preflight Request Reference
// https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

export default async (request: Request, _context: Context) => {
  if (request.method !== "OPTIONS") {
    return;
  }

  const { headers } = request;
  const reqMethod = headers.get("Access-Control-Request-Method");
  const reqHeaders = headers.get("Access-Control-Request-Headers");
  const reqOrigin = headers.get("Origin");
  if (
    reqMethod === null ||
    reqOrigin === null ||
    reqHeaders === null ||
    !allowMethods.includes(reqMethod) ||
    !isAllowedOrign(reqOrigin)
  ) {
    return;
  }

  const response = new Response(undefined, {
    status: 204,
  });
  response.headers.set("Access-Control-Allow-Origin", reqOrigin);
  response.headers.set("Access-Control-Allow-Methods", allowMethods);
  response.headers.set("Access-Control-Max-Age", `${60 * 60 * 24}`);

  // Need "Access-Control-Allow-Headers" to make it work in Firefox
  // See: https://stackoverflow.com/a/69479005
  response.headers.set("Access-Control-Allow-Headers", reqHeaders);

  return response;
};
