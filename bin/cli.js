#!/usr/bin/env node
import { main } from "../lib/main.js";

main().then(
  () => {
    process.exit(0);
  },
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
