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
  if (json.errors) throw new Error(json.errors);
  const filePath = path.join(dir, "tree.json");
  await fs.outputJson(filePath, json, { spaces: 2 });
};

const loadProps = async ({
  host,
  projectId,
}: {
  host: string;
  projectId: string;
}) => {
  const url = `${host}/rest/props/${projectId}`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.errors) throw new Error(json.errors);
  const filePath = path.join(dir, "props.json");
  await fs.outputJson(filePath, json, { spaces: 2 });
};

const loadBreakpoints = async ({
  host,
  projectId,
}: {
  host: string;
  projectId: string;
}) => {
  const url = `${host}/rest/breakpoints/${projectId}`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.errors) throw new Error(json.errors);
  const filePath = path.join(dir, "breakpoints.json");
  await fs.outputJson(filePath, json, { spaces: 2 });
};

const createIndex = async (files: Array<string>) => {
  const content = [];
  for (const fileName of files) {
    content.push(
      `export { default as ${fileName} } from "./${fileName}.json";`
    );
  }
  const filePath = path.join(dir, "index.ts");
  await fs.writeFile(filePath, content.join("\n"));
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

  await Promise.all([
    loadTree({ host: options.host, projectId }),
    loadProps({ host: options.host, projectId }),
    loadBreakpoints({ host: options.host, projectId }),
    createIndex(["props", "tree", "breakpoints"]),
  ]);

  console.log("Sync successful");
};
