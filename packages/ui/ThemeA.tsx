import "./theme.a.css";

// export with children
export const ThemeA = ({
  children,
  className,
}: {
  children: JSX.Element | JSX.Element[];
  className?: string;
}) => {
  return <div className={className}>{children}</div>;
};
