import React from "react";
interface LitTableProps<T> {
    data: T[];
    renderRow: (row: T, index: number) => React.ReactNode;
    headers: string[];
}
export declare function LitTable<T>({ data, renderRow, headers }: LitTableProps<T>): JSX.Element;
export {};
//# sourceMappingURL=LitTable.d.ts.map