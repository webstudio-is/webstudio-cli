export type Config = {
  [projectId: string]: Auth;
};
export type Auth = {
  token: string;
  host: string;
} | null;
