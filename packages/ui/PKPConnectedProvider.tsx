import { createContext, useContext, useEffect, useState } from "react";

const PKPConnectedContext = createContext({
  pkpConnected: false,
  selectedPKP: {},
  setSelected: (props: any) => {},
});

export const PKPConnectedProvider = (props: any) => {
  const [pkpConnectionInfo, setPKPConnectionInfo] = useState<any>({
    pkpConnected: false,
    selectedPKP: {},
  });

  useEffect(() => {
    function loadData() {
      // check localstorage if 'selected-pkp' exists
      // if yes, set pkpConnected to true
      // else, set pkpConnected to false

      try {
        const selectedPKP = localStorage.getItem("selected-pkp");
        if (selectedPKP) {
          // set pkpConnected to true
          setPKPConnectionInfo({
            pkpConnected: true,
            selectedPKP: JSON.parse(selectedPKP),
          });
        }
      } catch (e) {
        // set pkpConnected to false
        setPKPConnectionInfo({
          pkpConnected: false,
          selectedPKP: {},
        });
      }
    }

    loadData();
  }, []);

  const setSelected = (newSelectedPKP: any) => {
    setPKPConnectionInfo({
      pkpConnected: true,
      selectedPKP: newSelectedPKP,
    });
  };

  return (
    <PKPConnectedContext.Provider
      value={{
        pkpConnected: pkpConnectionInfo.pkpConnected,
        selectedPKP: pkpConnectionInfo.selectedPKP,
        setSelected,
      }}
    >
      {props.children}
    </PKPConnectedContext.Provider>
  );
};

export const usePKPConnectProvider = () => {
  return useContext(PKPConnectedContext);
};
