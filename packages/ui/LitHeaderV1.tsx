import { LitButton } from "./LitButton";
import { LitConnect } from "./LitConnect";
import { LitIcon } from "./LitIcon";
import { LitNavMenu } from "./LitNavMenu";

export const LitHeaderV1 = ({
  title,
  children,
}: {
  title: string;
  children?: any;
}) => {
  return (
    <div className="lit-header flex space-between">
      {/* logo */}
      <div className="flex gap-12">
        <LitIcon icon="lit-logo" width="100" className="header-logo" />
        <div className="flex center-item">
          <h3>{title}</h3>
        </div>
      </div>

      {/* nav */}

      <LitConnect />
    </div>
  );
};
