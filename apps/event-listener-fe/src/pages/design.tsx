import { useReducer } from "react";
import {
  ELEventSelector,
  ELIntervalSelector,
  LitEditor,
  LitInputTextV1,
  LitNote,
  StateReducer,
} from "ui";

const Design = () => {
  const [state, dispatch] = useReducer(StateReducer, {
    data: {},
    loading: false,
  });

  const renderTitle = (children: any) => {
    return <h3 className="pt-6 mb-4">{children}</h3>;
  };

  return (
    <div className="max-width-1024">
      {renderTitle("Usually a confirmation message")}
      <LitNote>
        <div className="error-box mb-8 text-center bold">
          Use at your own risk! This is a demo app.
          <br /> We are not responsible for any damages caused by this app.
        </div>
      </LitNote>

      {renderTitle("Interval Selector")}
      <div className="flex gap-4">
        <ELIntervalSelector />
      </div>

      {renderTitle("Event Selector (a wrapper of LitSelectionV1)")}
      <div className="w-full relative">
        <div className="flex gap-4">
          <ELEventSelector
            onClick={(item: any) => {
              console.log(item);
            }}
          />
        </div>
      </div>

      {renderTitle("This is an text editor")}
      <LitInputTextV1
        label="Testing"
        className="testing"
        onChange={(e: any) => {
          console.log(e.target.value);
        }}
      />

      {renderTitle("This is an text editor")}
      <LitEditor title="JS Parameters" />

      {renderTitle("Using grid")}
      <div className="grid grid-7-3 gap-12">
        <LitEditor title="Lit Action" />
        <LitEditor title="JS Parameters" />
      </div>
    </div>
  );
};

export default Design;
