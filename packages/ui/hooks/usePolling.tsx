import { DependencyList, useEffect } from "react";

export const usePolling = (
  callback: () => void,
  interval = 10000,
  deps: DependencyList = []
) => {
  useEffect(() => {
    const pollFunction = () => {
      callback();
    };

    pollFunction(); // Call the function immediately on mount
    const intervalId = setInterval(pollFunction, interval); // Set the custom interval

    return () => {
      clearInterval(intervalId); // Clean up the interval when the component is unmounted
    };
  }, [callback, interval, ...deps]); // Add interval and other dependencies
};
