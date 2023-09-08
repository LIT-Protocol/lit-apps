import { NextPageContext } from "next";

export const ssFetch = async (
  ctx: NextPageContext,
  path:
    | string
    | {
        path: string;
        method?: string;
        body: any;
      }
) => {
  if (typeof path === "object") {
    return await fetch(
      process.env.NODE_ENV === "development"
        ? `http://${ctx.req?.headers.host}/${path.path}`
        : `https://${ctx.req?.headers.host}/${path.path}`,
      {
        method: path?.method ?? "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(path?.body ?? {}),
      }
    );
  } else {
    return await fetch(
      process.env.NODE_ENV === "development"
        ? `http://${ctx.req?.headers.host}/${path}`
        : `https://${ctx.req?.headers.host}/${path}`
    );
  }
};
