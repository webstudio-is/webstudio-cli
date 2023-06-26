/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  /*
  If live reload causes page to re-render without changes (live reload is too fast),
  increase the dev server broadcast delay.

  If live reload seems slow, try to decrease the dev server broadcast delay.
  */
  devServerBroadcastDelay: 300,
  ignoredRouteFiles: ["**/.*"],
  server: "./server.ts",
  serverConditions: ["deno", "worker"],
  serverDependenciesToBundle: "all",
  serverMainFields: ["module", "main"],
  serverModuleFormat: "esm",
  serverPlatform: "neutral",
  // Not compatible with Deno?
  // serverDependenciesToBundle: [
  //   /@webstudio-is\/(?!prisma-client)/,
  //   "pretty-bytes",
  //   "nanoevents",
  //   "nanostores",
  //   "@nanostores/react",
  //   /micromark/,
  //   "decode-named-character-reference",
  //   "character-entities",
  //   /mdast-/,
  //   "unist-util-stringify-position",
  // ],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
