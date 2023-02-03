import { BrandLogo, Button, ThemeA } from "ui";
import { hello } from "@lit-dev/utils";
import { useEffect } from "react";

export default function Web() {
  useEffect(() => {
    hello();
  });

  return (
    <ThemeA>
      <div className="flex flex-col center p-12">
        <h1>Demos</h1>

        <ul>
          <li>
            {" "}
            <a href="/simple-encrypt-decrypt">Simple Encrypt Decrypt Page</a>
          </li>
        </ul>
      </div>
    </ThemeA>
  );
}
