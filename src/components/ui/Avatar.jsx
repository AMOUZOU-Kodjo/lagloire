import { initials } from "../../lib/formatters";

const SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base", xl: "w-24 h-24 text-2xl" };

export default function Avatar({ firstName = "", lastName = "", src, size = "md", className = "" }) {
  const sizeClass = SIZES[size] ?? SIZES.md;

  if (src) {
    return <img src={src} alt={`${firstName} ${lastName}`} className={`${sizeClass} rounded-full object-cover ${className}`} />;
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
      style={{ background: "linear-gradient(135deg,#37cdbe,#4a90e2)" }}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
