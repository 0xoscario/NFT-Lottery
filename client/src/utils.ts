// check if page was rendered on server
export const isSSR = typeof window === "undefined";

// promisified interval that waits for promise either resolve or reject
export const setIntervalAsync = (fn: () => Promise<any>, ms: number) => {
  const t = setTimeout(() => {
    fn().finally(() => {
      clearTimeout(t);
      setIntervalAsync(fn, ms);
    });
  }, ms);
};

// promisified timeout
export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const emptyAddress = "0x0000000000000000000000000000000000000000";
