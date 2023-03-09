// Error: transaction failed [ See: https://links.ethers.org/v5-errors-CALL_EXCEPTION ]
(transactionHash =
  "0x004a1130f3617bdfebb1741ed979c7ef589090455bba50a6c0140dd57a244533"),
  (transaction = {
    nonce: 77,
    gasPrice: { type: "BigNumber", hex: "0x2279740f12" },
    gasLimit: { type: "BigNumber", hex: "0x0249f0" },
    to: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    value: { type: "BigNumber", hex: "0x00" },
    data: "0x04e45aaf0000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa841740000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000fcf8a959e2d6ea185789c89e66c77319ab10e302000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    chainId: 137,
    v: 309,
    r: "0xe30b2013fbecf39c3b9340753ac57113178d907ce2e522dbf81b45c4217058bb",
    s: "0x357da46a37ee7e5c098728775d455d74cb2be2c2a07703959488b14416036b0d",
    from: "0xfcF8A959e2D6eA185789C89E66C77319AB10e302",
    hash: "0x004a1130f3617bdfebb1741ed979c7ef589090455bba50a6c0140dd57a244533",
    type: null,
    confirmations: 0,
  }),
  (receipt = {
    to: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    from: "0xfcF8A959e2D6eA185789C89E66C77319AB10e302",
    contractAddress: null,
    transactionIndex: 61,
    gasUsed: { type: "BigNumber", hex: "0x0179b4" },
    logsBloom:
      "0x00000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000100008000000000000000000000000000000000000000000000000000000000800000000000000000000100000000000000000000000000000000000000000000000000004000000080000000000800000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000004000001000000000000001000000000000000000000000000000100000000000000000000000000000000000000000004000000000000000000000000000100000",
    blockHash:
      "0x7f9755806527a6f25a100bc85a86867720404e19d34e7d5ee8545c31b0f5f96c",
    transactionHash:
      "0x004a1130f3617bdfebb1741ed979c7ef589090455bba50a6c0140dd57a244533",
    logs: [
      {
        transactionIndex: 61,
        blockNumber: 39879556,
        transactionHash:
          "0x004a1130f3617bdfebb1741ed979c7ef589090455bba50a6c0140dd57a244533",
        address: "0x0000000000000000000000000000000000001010",
        topics: [
          "0x4dfe1bbbcf077ddc3e01291eea2d5c70c2b422b415d95645b9adcfd678cb1d63",
          "0x0000000000000000000000000000000000000000000000000000000000001010",
          "0x000000000000000000000000fcf8a959e2d6ea185789c89e66c77319ab10e302",
          "0x0000000000000000000000003296233d946fb9399ff8bb87215eb312902d6224",
        ],
        data: "0x000000000000000000000000000000000000000000000000000aaf1b9069081400000000000000000000000000000000000000000000000013fb7d56de47a867000000000000000000000000000000000000000000000020059cab12a79d7e3f00000000000000000000000000000000000000000000000013f0ce3b4ddea05300000000000000000000000000000000000000000000002005a75a2e38068653",
        logIndex: 231,
        blockHash:
          "0x7f9755806527a6f25a100bc85a86867720404e19d34e7d5ee8545c31b0f5f96c",
      },
    ],
    blockNumber: 39879556,
    confirmations: 2,
    cumulativeGasUsed: { type: "BigNumber", hex: "0x9799ef" },
    effectiveGasPrice: { type: "BigNumber", hex: "0x2279740f12" },
    status: 0,
    type: 0,
    byzantium: true,
  });

// code=CALL_EXCEPTION, version=providers/5.7.2