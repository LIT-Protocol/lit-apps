export const LitNote = (prop: any) => {
  const defaultClass = "lit-note";

  // inject defaultClass into prop.className array
  const newProp = prop.className
    ? { ...prop, className: [...prop.className, ` ${defaultClass}`].join("") }
    : { ...prop, className: defaultClass };

  return <div {...newProp} />;
};
