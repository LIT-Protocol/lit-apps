import { describe, expect, test } from "@jest/globals";

import { executeSwap, swapStubs } from "./execute-swap";

import { publicKeyToEthAddress } from "@lit-dev/utils";

describe("lit-actions", () => {
  it("should pass", () => {
    console.log("swapStubs:", swapStubs);
    expect(true).toBe(true);
  });
});
