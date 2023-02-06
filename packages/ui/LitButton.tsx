import { LitIcon } from "./LitIcon";

type AnchorProps = React.AnchorHTMLAttributes<HTMLElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLElement>;
type LitButtonProp = AnchorProps | ButtonProps | any;

// turn it to const function
const isAnchor = (props: LitButtonProp): props is AnchorProps => {
  return (props as AnchorProps).href !== undefined;
};

const isIcon = (props: any) => {
  return (props as any).icon !== undefined;
};

export const LitButton = (props: LitButtonProp) => {
  const handleMouseOver = (e: any) => {
    const span = e.target.querySelector("span");

    if (!span) return;

    span.style.display = "block";
  };

  const handleMouseLeave = (e: any) => {
    const span = e.target.querySelector("span");

    if (!span) return;

    span.style.display = "none";
  };

  if (isAnchor(props)) {
    return <a className="lit-button" {...props} />;
  }
  if (isIcon(props)) {
    return (
      <button
        type="button"
        className="lit-button-icon"
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onClick={props.onClick}
      >
        <LitIcon icon={props.icon} />
        <span className="">{props.hoverText}</span>
      </button>
    );
  }
  return <button type="button" className="lit-button" {...props} />;
};
