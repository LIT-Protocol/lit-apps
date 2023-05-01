import { useState } from "react";
import { LitButton } from "ui";
import "ui/theme.purple.css";
// import "ui/utils.css";

export default function Web() {
  const [links, setLinks] = useState([
    {
      name: "Simple Encrypt Decrypt Demo",
      path: "/simple-encrypt-decrypt",
    },
    {
      name: "Cosmos Signing Demo",
      path: "/cosmos-signing-demo",
    },
  ]);

  return (
    <div className="flex flex-col center p-12">
      <h1>Lit Demo Apps</h1>

      <ul className="flex flex-col gap-8 pt-24">
        {links.map((link, index) => (
          <li key={index} className="m-auto">
            <LitButton className="lit-button-2" redirect={link.path}>
              {link.name}
            </LitButton>
          </li>
        ))}
      </ul>
    </div>
  );
}
