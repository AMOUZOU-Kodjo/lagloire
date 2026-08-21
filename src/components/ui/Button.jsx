const VARIANTS = {
  gold: "btn-gold",
  outline: "btn-outline",
  "outline-light": "btn-outline-light",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

export default function Button({
  as: Component = "button",
  variant = "gold",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const sizes = { sm: "btn-sm", md: "btn-md", lg: "btn-lg" };
  return (
    <Component
      className={`btn ${sizes[size] ?? sizes.md} ${VARIANTS[variant] ?? VARIANTS.gold} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}