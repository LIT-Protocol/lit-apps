export const LitInputTextV1 = (prop: any) => {
  const defaultClass = "lit-input-v1";

  const newProp = { ...prop, className: "" };

  return (
    <div className={`${defaultClass} ${prop.className}`}>
      <label>{prop.label}</label>
      <input type="text" {...newProp}></input>
    </div>
  );
};
