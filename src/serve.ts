import { BUILD_DIR } from "./lib.js";

export const serve = async () => {
  $.verbose = true;
  await $`pnpm -C ${BUILD_DIR} run start`;
};

export default serve;
