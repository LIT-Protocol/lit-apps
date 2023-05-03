import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
const PKPConnectedContext = createContext({
    pkpConnected: false,
    selectedPKP: {},
    setSelected: (props) => { },
});
export const PKPConnectionContext = (props) => {
    const [pkpConnectionInfo, setPKPConnectionInfo] = useState({
        pkpConnected: false,
        selectedPKP: {},
    });
    useEffect(() => {
        function loadData() {
            // check localstorage if 'lit-selected-pkp' exists
            // if yes, set pkpConnected to true
            // else, set pkpConnected to false
            try {
                const selectedPKP = localStorage.getItem("lit-selected-pkp");
                if (selectedPKP) {
                    // set pkpConnected to true
                    setPKPConnectionInfo({
                        pkpConnected: true,
                        selectedPKP: JSON.parse(selectedPKP),
                    });
                }
            }
            catch (e) {
                // set pkpConnected to false
                setPKPConnectionInfo({
                    pkpConnected: false,
                    selectedPKP: {},
                });
            }
        }
        loadData();
    }, []);
    const setSelected = (newSelectedPKP) => {
        setPKPConnectionInfo({
            pkpConnected: true,
            selectedPKP: newSelectedPKP,
        });
    };
    return (_jsx(PKPConnectedContext.Provider, Object.assign({ value: {
            pkpConnected: pkpConnectionInfo.pkpConnected,
            selectedPKP: pkpConnectionInfo.selectedPKP,
            setSelected,
        } }, { children: props.children })));
};
export const usePKPConnectionContext = () => {
    return useContext(PKPConnectedContext);
};
