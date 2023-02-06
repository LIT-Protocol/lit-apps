import { LitIcon } from "./LitIcon";

export const LitLoading = (props: any) => {
  return (
    <div className={`lit-loading`}>
      <LitIcon
        className="lit-loading-icon"
        icon={props.icon ?? "lit-logo-text"}
      />
      {props.text && <div className="lit-loading-text">{props.text}</div>}
    </div>
  );
};
