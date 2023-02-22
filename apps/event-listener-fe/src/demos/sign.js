(async () => {
  const sigShare = await LitActions.signEcdsa({
    toSign,
    publicKey,
    sigName,
  });
})();
