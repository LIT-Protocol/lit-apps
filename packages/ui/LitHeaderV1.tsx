import { LitButton } from "./LitButton";
import { LitConnect } from "./LitConnect";
import { LitIcon } from "./LitIcon";

export const LitHeaderV1 = ({
  title,
  children,
}: {
  title: string;
  children?: any;
}) => {
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
      <ul className="flex gap-18">
        <LitButton className="lit-link" redirect="/">
          Dashboard
        </LitButton>
        <LitButton className="lit-link" redirect="/tasks">
          Tasks
        </LitButton>
      </ul>

      <LitConnect />
    </div>
  );
};
