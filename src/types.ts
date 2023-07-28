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

export enum ProjectType {
  "vercel" = "vercel",
  "defaults" = "defaults",
  "remix-app-server" = "remix-app-server",
}
