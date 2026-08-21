export default function Tabs({ tabs, active, onChange, dark = false }) {
  return (
    <div className={`tabs ${dark ? "" : "tabs-border"}`}>
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        const base = `tab tab-sm`;
        const state = dark
          ? isActive
            ? "tab-active bg-gold text-ink rounded-full border-gold"
            : "text-soft-dark"
          : isActive
            ? "tab-active"
            : "";
        return (
          <button key={tab.value} onClick={() => onChange(tab.value)} className={`${base} ${state}`}>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}