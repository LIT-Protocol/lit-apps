import { describe, expect, test } from "@jest/globals";

import { publicKeyToEthAddress } from "./public-key-to-eth-address";

describe("utils", () => {
  it("should convert pub key to eth address", () => {
    const addr = publicKeyToEthAddress(
      "04c9ebb41c4b40177565c63997cf2bd88d0dbc6cdd343700ed0cbb45a3ce89744808abcc549de6fd045d55fe8d5fc292164c71ca0fb2f6e2db3f5ce0a323e65067"
    );
    expect(addr).toBe("0x070e90befc1e8ec3ed7398b86b858f6d6a6e91fc");
  });
});
