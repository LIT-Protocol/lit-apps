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
      <ul className="flex">
        <LitButton
          className={`lit-link animate ${currentPath == "/" ? "active" : ""}`}
          redirect="/"
        >
          Apps
        </LitButton>
        <LitButton
          className={`lit-link animate ${
            currentPath == "/tasks" ? "active" : ""
          }`}
          redirect="/tasks"
        >
          Tasks
        </LitButton>
      </ul>

      <LitConnect />
    </div>
  );
};
