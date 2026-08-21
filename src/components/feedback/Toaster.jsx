import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { useToastStore } from "../../store/toastStore";

const ALERT_CLASS = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
  warning: "alert-warning",
};

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

/** Conteneur global des toasts — à monter une seule fois dans App. */
export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="toast toast-end toast-bottom z-[9999]" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] ?? Info;
        return (
          <div key={t.id} className={`alert ${ALERT_CLASS[t.type] ?? ALERT_CLASS.info} shadow-lg`}>
            <Icon size={18} className="flex-shrink-0" />
            <div>
              {t.title && <p className="font-semibold text-sm">{t.title}</p>}
              <p className="text-sm">{t.message}</p>
            </div>
            <button onClick={() => dismiss(t.id)} aria-label="Fermer" className="btn btn-ghost btn-circle btn-sm ml-auto">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}