/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  server:
    process.env.NETLIFY || process.env.NETLIFY_LOCAL
      ? "./server.ts"
      : undefined,
  serverBuildPath: ".netlify/functions-internal/server.js",
  serverDependenciesToBundle: [
    /@webstudio-is\/(?!prisma-client)/,
    "pretty-bytes",
    "nanoevents",
    "nanostores",
    "@nanostores/react",
    /micromark/,
    "decode-named-character-reference",
    "character-entities",
    /mdast-/,
    "unist-util-stringify-position",
  ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
