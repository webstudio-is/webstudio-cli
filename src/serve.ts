export const serve = async () => {
  $.verbose = true;
  await $`npm run start`;
};
