import type { Build, Page } from "@webstudio-is/project-build";
import type { Params } from "@webstudio-is/react-sdk";
import type { Asset } from "@webstudio-is/asset-uploader";

export type Config = {
  [projectId: string]: Auth;
};

export type Auth = {
  token: string;
  host: string;
} | null;

export interface File {
  name: string;
  content: string;
  encoding: "utf-8";
}

export interface Folder {
  name: string;
  files: File[];
  subFolders: Folder[];
}

export type ComponentsByPage = {
  [path: string]: Set<string>;
};

export type SiteDataByPage = {
  [path: string]: {
    page: Page;
    build: Pick<Build, "props" | "instances" | "dataSources" | "deployment">;
    assets: Array<Asset>;
    params?: Params;
    pages: Array<Page>;
  };
};

export type RemixRoutes = {
  routes: Array<{
    path: string;
    file: string;
  }>;
};

export enum ProjectType {
  "vercel" = "vercel",
  "defaults" = "defaults",
  "remix-app-server" = "remix-app-server",
}
