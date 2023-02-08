export const LitHero = (prop: any) => {
  const defaultClass = "lit-hero";

  // inject defaultClass into prop.className array
  const newProp = prop.className
    ? { ...prop, className: [...prop.className, ` ${defaultClass}`].join("") }
    : { ...prop, className: defaultClass };

  return (
    <section {...newProp}>
      <h1>{newProp.title}</h1>
      <p>{newProp.description}</p>
    </section>
  );
};
