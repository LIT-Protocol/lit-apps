import { toast } from "react-hot-toast";
import { LitIcon } from "./LitIcon";

interface LitCopyProps {
  copyText: string;
  text: string;
}

export const LitCopy = (props: LitCopyProps) => {
  // copy to clipboard
  const copyToClipboard = (e: any) => {
    if (!props.copyText) return;

    navigator.clipboard.writeText(props.copyText);

    toast(`🔥 Copied ${props.text}`, { duration: 1000 });
  };

  return ( 
    <>
      <div className="">{props.text}</div>
      <div className="lit-icon-wrapper flex gap-6">
        <LitIcon onClick={copyToClipboard} icon="copy"></LitIcon>
      </div>
    </>
  );
};
