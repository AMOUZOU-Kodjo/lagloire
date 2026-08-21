import { useRef } from "react";

/** Saisie de code à 6 chiffres : cases auto-avancées, coller supporté, autoComplete OTP. */
export default function OtpInput({ value = "", onChange, disabled = false }) {
  const refs = useRef([]);
  const digits = value.split("");

  const setDigit = (i, digit) => {
    const chars = digits.slice(0, 6);
    chars[i] = digit;
    onChange(chars.join(""));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) setDigit(i, "");
      else if (i > 0) {
        refs.current[i - 1]?.focus();
        setDigit(i - 1, "");
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={digits[i] ?? ""}
          disabled={disabled}
          inputMode="numeric"
          aria-label={`Chiffre ${i + 1} du code`}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={i === 0 && !disabled}
          maxLength={1}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`input !rounded-md flex-1 min-w-0 text-center text-xl font-mono !h-12 p-0 transition-shadow ${
            digits[i] ? "!border-gold shadow-[0_0_0_3px_rgba(55,205,190,.15)]" : ""
          } ${disabled ? "opacity-60" : ""}`}
        />
      ))}
    </div>
  );
}