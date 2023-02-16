import { LitButton } from "./LitButton";
import { LitConnect } from "./LitConnect";
import { LitIcon } from "./LitIcon";
import Router from "next/router";
import { useEffect, useState } from "react";

export const LitHeaderV1 = ({
  title,
  children,
}: {
  title: string;
  children?: any;
}) => {
  const [currentPath, setCurrentPath] = useState<string>("/");

  const navItems = [
    {
      route: "/",
      name: "Apps",
    },
    {
      route: "/tasks",
      name: "Tasks",
    },
  ];

  useEffect(() => {
    const { pathname } = Router;
    setCurrentPath(pathname);
  });

  return (
    <div className="lit-header flex space-between center-item">
      {/* logo */}
      <LitButton redirect="/">
        <div className="flex gap-12">
          <LitIcon icon="lit-logo" width="100" className="header-logo" />
          <div className="flex center-item">
            <h3>{title}</h3>
          </div>
        </div>
      </LitButton>

      {/* nav */}
      <ul className="lit-nav-middle flex">
        {navItems.map((item: any, index: number) => {
          return (
            <LitButton
              key={index}
              className={`lit-link animate ${
                currentPath == item.route ? "active" : ""
              }`}
              redirect={item.route}
            >
              {item.name}
            </LitButton>
          );
        })}
      </ul>

      <LitConnect />
    </div>
  );
};
