import fs from "fs-extra";
import * as path from "path";

const dir = path.join(process.cwd(), ".webstudio");

const loadTree = async ({
  host,
  projectId,
}: {
  host: string;
  projectId: string;
}) => {
  const url = `${host}/rest/tree/${projectId}`;
  const response = await fetch(url);
  const json = await response.json();
  const filePath = path.join(dir, "tree.json");
  await fs.outputJson(filePath, json, { spaces: 2 });
};

type Options = {
  host?: string;
};

export const sync = async (projectId: string, options: Options) => {
  if (typeof projectId !== "string") {
    throw new Error("Project ID is required");
  }
  if (typeof options.host !== "string") {
    throw new Error("Host is required");
  }

  await Promise.all([loadTree({ host: options.host, projectId })]);
};
