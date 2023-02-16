import { getShortAddress } from "@lit-dev/utils";
import { LitNote, usePKPConnectionContext } from "ui";

export const ELNotes = () => {
  const { pkpConnected, selectedPKP } = usePKPConnectionContext();

  return (
    <>
      <LitNote>
        {/* <h2 className="mb-4">NOTE</h2> */}
        <div className="error-box mb-8 text-center bold">
          Use at your own risk! This is a demo app.
          <br /> We are not responsible for any damages caused by this app.
        </div>
        {/* <h2>Upload and permit lit action to use your PKP</h2> */}
        {/* <div>TokenID: {selectedPKP.tokenId}</div> */}
        <div className="mb-8 flex flex-col text-center">
          <p>
            By creating this trigger, you will allow the lit action to use your
            PKP for signing.
          </p>
          <p>Anyone can run this trigger as long as it meets the conditions.</p>
        </div>

        <div>
          <div className="flex flex-col txt-grey text-sm">
            <div>PKP Token ID: {getShortAddress(selectedPKP.tokenId)}</div>
            <div>ETH Address: {getShortAddress(selectedPKP.ethAddress)}</div>
          </div>
        </div>
      </LitNote>
    </>
  );
};
