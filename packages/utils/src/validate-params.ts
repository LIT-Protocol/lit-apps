// create a function that validates each params must not be generally
// falsy, and that the tokenIn and tokenOut must have the same chainId
export const validateParams = (props: object, type: string) => {
    const errors = [];
  
    for (const key in props) {
      if (type == "not_empty") {
        if (!props[key]) {
          errors.push(`${key} is required`);
          console.error(`${key} is required`);
        }
      }
    }
  
    // return 500 if there are any errors
    if (errors.length > 0) {
      return {
        status: 500,
        errors,
      };
    }
  
    // return 200 if there are no errors
    return {
      status: 200,
      result: "success",
    };
  };
  