const METHODS = [
  { value: "FLOOZ", label: "Flooz", sub: "Moov Africa" },
  { value: "TMONEY", label: "T-Money", sub: "Togocom" },
  { value: "CARTE", label: "Carte bancaire", sub: "Visa / Mastercard" },
  { value: "PAYPAL", label: "PayPal", sub: "Diaspora" },
];

export default function PaymentMethodPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {METHODS.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(m.value)}
          className="card rounded-lg p-4 text-left"
          style={value === m.value ? { borderColor: "#37cdbe", borderWidth: 2 } : undefined}
        >
          <p className="font-semibold text-sm">{m.label}</p>
          <p className="text-xs text-soft">{m.sub}</p>
        </button>
      ))}
    </div>
  );
}
