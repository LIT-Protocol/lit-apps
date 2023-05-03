var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
var PKPConnectedContext = createContext({
    pkpConnected: false,
    selectedPKP: {},
    setSelected: function (props) { },
});
export var PKPConnectionContext = function (props) {
    var _a = useState({
        pkpConnected: false,
        selectedPKP: {},
    }), pkpConnectionInfo = _a[0], setPKPConnectionInfo = _a[1];
    useEffect(function () {
        function loadData() {
            // check localstorage if 'lit-selected-pkp' exists
            // if yes, set pkpConnected to true
            // else, set pkpConnected to false
            try {
                var selectedPKP = localStorage.getItem("lit-selected-pkp");
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
    var setSelected = function (newSelectedPKP) {
        setPKPConnectionInfo({
            pkpConnected: true,
            selectedPKP: newSelectedPKP,
        });
    };
    return (_jsx(PKPConnectedContext.Provider, __assign({ value: {
            pkpConnected: pkpConnectionInfo.pkpConnected,
            selectedPKP: pkpConnectionInfo.selectedPKP,
            setSelected: setSelected,
        } }, { children: props.children })));
};
export var usePKPConnectionContext = function () {
    return useContext(PKPConnectedContext);
};
