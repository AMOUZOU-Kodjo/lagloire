/** Bandeau d'en-tête de page — fond dégradé clair, motif de points et arc de l'aube signature. */
export default function PageHero({ eyebrow, title, description, className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#f2f2f2] to-[#e5e6e6] ${className}`}>
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      {/* Arc de l'aube signature */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -bottom-[280px] left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(55,205,190,.16) 0%, rgba(55,205,190,.05) 34%, rgba(55,205,190,0) 60%)",
          }}
        />
        <div className="absolute -bottom-[210px] left-1/2 -translate-x-1/2 w-[920px] h-[920px] rounded-full border-t border-gold/25" />
        <div className="absolute -bottom-[140px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border-t border-gold/15" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-16 text-center">
        {eyebrow && (
          <div className="divider-eyebrow justify-center mb-4">
            <span /> {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#37cdbe]">{title}</h1>
        {description && <p className="mt-3 text-sm md:text-base max-w-lg mx-auto text-[#6b7280]">{description}</p>}
      </div>
    </div>
  );
}