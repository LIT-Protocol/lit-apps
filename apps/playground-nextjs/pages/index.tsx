import { BrandLogo, Button } from "ui";
import { hello } from "@lit-dev/utils";
import { useEffect } from "react";

export default function Web() {
  useEffect(() => {
    hello();
  });

  return (
    <div>
      <h1>Web</h1>
      <Button />
      <BrandLogo />
    </div>
  );
}
