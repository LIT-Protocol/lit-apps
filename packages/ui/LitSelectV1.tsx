import { useState } from "react";

export const LitSelectionV1 = (prop: any) => {
  const defaultClass = "lit-selection-v1";

  // inject defaultClass into prop.className array
  const newProp = prop.className
    ? { ...prop, className: [...prop.className, ` ${defaultClass}`].join("") }
    : { ...prop, className: defaultClass };

  // states
  const [selected, setSelected] = useState<any>(null);

  //   handle click
  const handleClick = (item: any) => {
    setSelected(item);
    prop?.onClick(item);
  };

  return (
    <>
      {prop?.items?.map(
        (
          item: {
            name: string;
            enabled: boolean;
          },
          index: number
        ) => {
          return (
            <prop.button.component
              onClick={() => handleClick(item)}
              className={`
              ${prop.button.className} ${item?.enabled ? "" : "disabled"}
              ${selected?.name === item?.name ? "active" : ""}
              `}
              key={index}
            >
              {item?.name}
            </prop.button.component>
          );
        }
      )}
    </>
  );
};
