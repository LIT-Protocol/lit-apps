export const safeFetch = async (
  url: string,
  body?: object,
  onError?: Function,
  options?: { debug?: boolean }
) => {
  const log = (msg: any, param?: any) => {
    if (options?.debug) {
      console.warn(`[safeFetch] ${msg}`, param ?? "");
    }
  };

  log("Fetching", url);
  // if there's a body, use 'post', otherwise use 'get'
  let method: string = body ? "post" : "get";

  log("Body:", body);

  try {
    log("Trying to fetch in try block", url);
    let res = await fetch(url, {
      method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (res.status !== 200) {
      const error = {
        status: res.status,
        message: (await res.json()).data?.message,
      };

      log("Got an error:", error);

      if (onError) {
        log("Using onError callback 1");
        onError(error);
        return;
      }
      log("throwing error 1");
      throw new Error(error?.message);
    }

    let result: any;
    log("2 ERROR");
    try {
      result = await res.json();
      log("Got the result in JSON format", result);
    } catch (e) {
      result = await res.text();
      log("Got the result in text format", result);
    }

    return result;
  } catch (e: any) {
    log("3 ERROR");
    if (onError) {
      log("Using onError callback 2");
      onError(e);
      return;
    }
    log("throwing error 2");
    throw new Error(e);
  }
};
