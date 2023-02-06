export const validateParams = (type: string, params: Array<any>) => {
  const results: any = [];

  params.forEach((param) => {
    let message: string = "";

    const paramName = Object.entries(param)[0][0];

    const value: any = Object.entries(param)[0][1];

    let validated: boolean = false;

    if (type === "must_have") {
      validated = value !== undefined && value !== null && value !== "";

      if (!validated) {
        message = `Please enter a value for "${paramName}"`;
      }
    }

    if (type === "is_json") {
      try {
        JSON.parse(value);
        validated = true;
      } catch (e) {
        validated = false;
      }

      if (!validated) {
        message = `"${paramName}" is not a valid JSON string`;
      }
    }

    results.push({ validated, message });
  });

  // check if all params are validated
  const validated = results.every((result: any) => result.validated);

  // join all messages
  const messages = results
    .map((result: any) => result.message)
    .filter((m: any) => m !== "");

  return { validated, message: messages };
};
