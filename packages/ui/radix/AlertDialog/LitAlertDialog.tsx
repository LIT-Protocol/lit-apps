import { useEffect } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import "./styles.css";

// <AlertDialog.Trigger asChild>
//   {/* <button className="Button violet">Delete account</button> */}
//   {prop.children}
// </AlertDialog.Trigger>
const LitAlertDialog = (prop: any) => (
  <AlertDialog.Root {...prop}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="AlertDialogOverlay" />
      <AlertDialog.Content className="AlertDialogContent">
        <AlertDialog.Title className="AlertDialogTitle">
          Are you absolutely sure?
        </AlertDialog.Title>
        <AlertDialog.Description className="AlertDialogDescription">
          {prop.description}
        </AlertDialog.Description>
        <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
          <AlertDialog.Cancel asChild>
            <button onClick={() => prop?.onCancel()} className="Button mauve">
              Cancel
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button onClick={() => prop?.onConfirm()} className="Button red">
              Yes, delete account
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export default LitAlertDialog;
