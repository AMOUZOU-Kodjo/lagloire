export default function LegalSection({ icon: Icon, title, children }) {
  return (
    <section className="bg-[#f2f2f2] rounded-2xl p-6">
      <h2 className="flex items-center gap-3 font-display text-xl text-[#1f2937] mb-4">
        <span className="w-9 h-9 rounded-lg bg-[#37cdbe]/10 flex items-center justify-center text-[#37cdbe]">
          <Icon className="w-5 h-5" />
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#6b7280]">{children}</div>
    </section>
  );
}