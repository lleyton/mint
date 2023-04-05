export type ApiComponent = {
  type: string;
  children:
    | { filename?: string; html?: string; name?: unknown; children: ApiComponent[] }[]
    | undefined;
};
