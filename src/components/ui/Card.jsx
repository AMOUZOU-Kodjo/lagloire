export default function Card({ dark = false, className = "", children, ...props }) {
  return (
    <div className={`card ${dark ? "card-dark" : ""} rounded-md ${className}`} {...props}>
      {children}
    </div>
  );
}