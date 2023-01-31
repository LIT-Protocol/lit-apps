import "./theme.a.css";

// export with children
export const ThemeA = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  return <>{children}</>;
};
