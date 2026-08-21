import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, className = "" }) {
  if (!open) return null;

  return (
    <div className="modal modal-middle modal-open" role="dialog" aria-modal="true">
      <div className={`modal-box rounded-lg p-6 max-w-lg ${className}`}>
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-display text-xl">{title}</h3>}
          <button onClick={onClose} aria-label="Fermer" className="btn btn-ghost btn-circle btn-sm ml-auto text-soft hover:text-ink">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
      <div className="modal-backdrop" onClick={onClose}>
        <button aria-label="Fermer" tabIndex={-1} />
      </div>
    </div>
  );
}