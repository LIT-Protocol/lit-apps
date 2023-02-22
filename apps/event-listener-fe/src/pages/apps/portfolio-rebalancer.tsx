import { safeFetch } from "@lit-dev/utils";
import beautify from "json-beautify";
import { NextPageContext } from "next";
import { useEffect, useReducer } from "react";
import {
  AuthProviderContext,
  DivWithTitle,
  ELEventSelector,
  ELEventSelectorOptions,
  LitButton,
  LitEditor,
  LitLoading,
  StateReducer,
  usePKPConnectionContext,
} from "ui";
import { ELNotes } from "../../components/ELNotes";
import { ssFetch } from "../../utils/ssFetch";
import toast from "react-hot-toast";
import { validateParams } from "@lit-dev/utils/util-param-validator";
import { useAccount } from "wagmi";
import { LitContracts } from "@lit-protocol/contracts-sdk";

type PageProp = {
  demoCode: string;
  demoParams: string;
  signCode: string;
  signParams: string;
};

export default function PortfolioRebalancer(ssProp: PageProp) {
  const [state, dispatch] = useReducer(StateReducer, {
    data: {
      jsCode: ssProp.demoCode,
      jsonCode: JSON.parse(ssProp.demoParams),
    },
    loading: false,
  });

  const { address, isConnected } = useAccount();

  const { pkpConnected, selectedPKP } = usePKPConnectionContext();

  /**
   * @description - This is the main function that runs the pipeline
   * @returns {void} - Nothing
   */
  const runPipeline = async () => {
    console.warn("state.data:", state.data);

    // -------------------------------
    //          Validations
    // -------------------------------
    const check_1 = validateParams("must_have", [
      {
        "Lit Action Code": state.data.jsCode,
        "Js Params": state.data.jsonCode,
      },
    ]);

    const check_2 = validateParams("is_json", [
      { JsParams: state.data.jsonCode },
    ]);

    console.warn("check_2:", state.data.jsonCode);

    if (!check_1.validated || !check_2.validated) {
      const messages = [...check_1.message, ...check_2.message];

      toast.error(messages.join(","));

      return;
    }

    // --------------------------------------------------------
    //          Uploading to Lit Action Code to IPFS
    // --------------------------------------------------------
    console.log("ssProp.signCode:", ssProp.signCode);
    dispatch({
      type: "LOADING",
      loadingMessage: "Uploading Lit Action...",
    });

    const registerData = await safeFetch(
      "/api/register-lit-action",
      ssProp.signCode as any,
      (e: Error) => {
        dispatch({ type: "SET_DATA" });
        toast.error(e.message);
      }
    );

    // ----------------------------------------------------
    //          Permit Lit Action to use the PKP
    // ----------------------------------------------------
    const contract = new LitContracts();
    await contract.connect();

    let addPermittedActionRes;

    try {
      addPermittedActionRes =
        await contract.pkpPermissionsContractUtil.write.addPermittedAction(
          selectedPKP.tokenId,
          registerData.data.IpfsHash
        );
      console.log("addPermittedActionRes:", addPermittedActionRes);
    } catch (e: any) {
      toast.error("Error permitting action");
      console.error("e:", e);
      dispatch({ type: "SET_DATA" });
      return;
    }

    dispatch({
      type: "LOADING",
      loadingMessage: "Submitting Job...",
    });

    const submitData = await safeFetch(
      "/api/submit-job",
      {
        ownerAddress: address,
        pkpInfo: selectedPKP,
        ipfsId: `MOCK_REBALANCER-${registerData.data.IpfsHash}`,
        jsParams: state.data.jsonCode,
        eventType: state.data.event?.name,
        eventParams: state.data.eventOptions,
      },
      (e: Error) => {
        toast.error(e.message);
        dispatch({
          type: "LOADING",
          loading: false,
        });
      }
    );

    console.log("submitData:", submitData);

    // await testRunLitAction();
    dispatch({
      type: "STOP_LOADING",
    });

    if (!submitData) {
      toast.error("Job Submission Failed");
    } else {
      toast.success("Job Submitted Successfully. Create another one?");
    }
  };

  const testRunLitAction = async () => {
    const res = await safeFetch(
      "/api/portfolio-rebalancer",
      {
        jsParams: state.data.jsonCode,
      },
      (e: Error) => {
        toast.error(e.message);
      }
    );

    console.log("res:", res);
  };

  return (
    <AuthProviderContext>
      <div className="flex-col">
        <div className="cls-app max-width-1024">
          {/* {JSON.stringify(state, null, 2)} */}
          {/* <br /> */}
          {/* {state.loading ? "loading" : "not loading"} */}
          <div className="grid grid-7-3 gap-12">
            {/* 
          // ------------------------------------------
          //          INPUT: Lit Action Code                                    
          // ------------------------------------------
          */}
            <LitEditor
              defaultCode={`${ssProp.demoCode}`}
              onChange={(value: any) => {
                dispatch({
                  type: "SET_DATA",
                  payload: {
                    jsCode: value,
                  },
                });
              }}
              title="Lit Action"
            />
            {/* 
        // -------------------------------------------------
        //          INPUT: Lit Action JSON Params                                    
        // -------------------------------------------------
        */}
            <LitEditor
              language="json"
              defaultCode={`${ssProp.demoParams}`}
              onChange={(value: any) => {
                dispatch({
                  type: "SET_DATA",
                  payload: {
                    jsonCode: value,
                  },
                });
              }}
              title="JS Parameters"
              options={{
                fontSize: 10,
                wordWrap: "off",
                minimap: {
                  enabled: false,
                },
              }}
              tools={{
                beautifyJson: true,
              }}
            />
          </div>

          <div className="h-12"></div>
          <div className="flex gap-12">
            {/* 
            // -------------------------------------
            //          INPUT: Event Type                                    
            // -------------------------------------
          */}
            <DivWithTitle title="Event">
              <div className="grid grid-cols-4 gap-6">
                <ELEventSelector
                  onClick={(item: any) => {
                    dispatch({
                      type: "SET_DATA",
                      payload: {
                        event: item,
                      },
                    });
                  }}
                />
              </div>
            </DivWithTitle>

            {/* 
            // ------------------------------------------
            //          Selected Event Options                                    
            // ------------------------------------------
          */}
            <DivWithTitle>
              <div className="w-full relative">
                <ELEventSelectorOptions
                  onChange={(state: any) => {
                    console.warn("state:", state);

                    dispatch({
                      type: "SET_DATA",
                      payload: {
                        eventOptions: state,
                      },
                    });
                  }}
                />
              </div>
            </DivWithTitle>
          </div>
          <div className="h-12"></div>
          <ELNotes />
          <div className="h-12"></div>
          {/* -- if it's not loading */}
          {!state.loading ? (
            <div className="flex flex-col gap-12">
              <div className="flex flex-col">
                <LitButton onClick={runPipeline}>Create</LitButton>
              </div>
            </div>
          ) : (
            // -- if it's loading
            <div className="mb-12 flex center-item justify-center">
              <LitLoading icon="lit-logo" text={state.loadingMessage} />
            </div>
          )}
        </div>
      </div>
    </AuthProviderContext>
  );
}

// fetch on server side
export async function getServerSideProps(ctx: NextPageContext) {
  const option = {
    path: "api/demo-code",
    body: {
      fileName: "portfolio-rebalancer",
    },
  };

  const data: any = await ssFetch(ctx, option).then((res) => res.json());

  const signCodeData: any = await ssFetch(ctx, {
    path: "api/demo-code",
    body: {
      fileName: "sign",
    },
  }).then((res) => res.json());

  const ssProp: PageProp = {
    demoCode: data.code,
    demoParams: data.jsParams,
    signCode: signCodeData.code,
    signParams: signCodeData.jsParams,
  };

  return {
    props: ssProp,
  };
}
