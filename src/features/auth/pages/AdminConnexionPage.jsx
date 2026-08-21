import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, ChevronLeft, Users, Calendar, BarChart3, Loader2 } from "lucide-react";
import { Input, Button } from "../../../components/ui";
import AuthShell from "../components/AuthShell";
import { useAdminLogin } from "../hooks/useAdminLogin";

export default function AdminConnexionPage() {
  const { email, setEmail, password, setPassword, error, loading, submit } = useAdminLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthShell
      eyebrow="Back-office ETDV"
      title="Espace des responsables"
      subtitle="Identifiez-vous pour gérer la communauté : membres, événements, dons et diffusions."
      quote="« Que tout se fasse avec ordre et avec décence. »"
      quoteRef="— 1 Corinthiens 14:40"
      features={[
        { icon: Users, text: "Gestion des membres, rôles et églises" },
        { icon: Calendar, text: "Événements, programmes et diffusions en direct" },
        { icon: BarChart3, text: "Dons, contacts et statistiques de la communauté" },
      ]}
      footerNote="Accès restreint — toute tentative non autorisée est journalisée."
    >
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="card rounded-lg p-7">
        <Input
          label="ADRESSE EMAIL"
          type="email"
          required
          autoFocus
          autoComplete="email"
          name="email"
          disabled={loading}
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="responsable@etdv.org"
        />

        <div className="mt-4">
          <Input
            label="MOT DE PASSE"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            name="password"
            disabled={loading}
            icon={<Lock size={16} />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="w-9 h-9 flex items-center justify-center rounded-md text-soft hover:text-ink hover:bg-sand-2 transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-soft">
            <ShieldCheck size={12} className="text-gold-dim" />
            SESSION 15 MIN
          </span>
          <Link
            to="/contact"
            className="text-xs text-soft hover:text-gold-dim hover:underline transition"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="mt-3 flex items-start gap-2 rounded-lg bg-brick/10 border border-brick/25 p-3 text-xs text-brick">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" className="w-full mt-5" disabled={loading || !email.trim() || !password}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </Button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-line" />
          <Link
            to="/connexion"
            className="text-xs text-soft hover:text-ink transition inline-flex items-center gap-1"
          >
            <ChevronLeft size={13} /> Connexion par code pour les fidèles
          </Link>
          <div className="flex-1 h-px bg-line" />
        </div>
      </form>
    </AuthShell>
  );
}