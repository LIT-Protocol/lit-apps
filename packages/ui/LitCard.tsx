import Router from "next/router";

export const LitCard = (prop: any) => {
  const defaultClass = "lit-card";

  // inject defaultClass into prop.className array
  const newProp = prop.className
    ? { ...prop, className: [...prop.className, ` ${defaultClass}`].join("") }
    : { ...prop, className: defaultClass };

  const handleClick = (e: any) => {
    e.preventDefault();
    Router.push(prop.href);
  };

  return (
    <a onClick={handleClick} href={newProp.href} {...newProp}>
      {prop.children}
      <h3>{prop.title}</h3>
      <p>{prop.description}</p>
    </a>
  );
};
