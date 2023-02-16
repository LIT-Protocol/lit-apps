export const DivWithTitle = (prop: any) => {
  const defaultClass = "div-with-title";

  return (
    <div className={`${defaultClass}`}>
      <h1 className={`${!prop.title ? "invisible" : ""}`}>
        {!prop.title ? "*" : prop.title}
      </h1>
      <section>{prop.children}</section>
    </div>
  );
};
