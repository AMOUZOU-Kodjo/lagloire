import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, KeyRound, Feather, Lock, MessageCircle } from "lucide-react";
import { Input, Button } from "../../../components/ui";
import AuthShell from "../components/AuthShell";
import OtpInput from "../components/OtpInput";
import { authApi } from "../../../api/auth.api";
import { useOtpLogin } from "../hooks/useOtpLogin";
import { useAuthStore } from "../../../store/authStore";

const STEP_EMAIL = "email";
const STEP_CODE = "code";

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div role="alert" aria-live="polite" className="mt-4 flex items-start gap-2 rounded-lg bg-brick/10 border border-brick/25 p-3 text-xs text-brick">
      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default function ConnexionPage() {
  const {
    step, email, setEmail, code, setCode, firstName, setFirstName,
    lastName, setLastName, phone, setPhone, isNewUser, error, loading,
    sendOtp, verifyOtp, backToEmail,
  } = useOtpLogin();

  const navigate = useNavigate();
  const location = useLocation();
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  // Mode alternatif : connexion classique email + mot de passe
  const [passwordMode, setPasswordMode] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const loginWithPassword = async (event) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      loginSuccess({ user: res.data.user, accessToken: res.data.accessToken });
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Connexion impossible.";
      setPasswordError(
        message.includes("incorrect")
          ? "Email ou mot de passe incorrect. Pas encore de mot de passe ? Recevez un code par email."
          : message
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const [resent, setResent] = useState(false);
  const resentTimer = useRef(null);

  useEffect(() => () => clearTimeout(resentTimer.current), []);

  const resend = () => {
    sendOtp();
    setResent(true);
    clearTimeout(resentTimer.current);
    resentTimer.current = setTimeout(() => setResent(false), 4000);
  };

  const progress = step === STEP_EMAIL ? 0 : 1;

  return (
    <AuthShell
      eyebrow="Espace membres"
      title="Heureux de vous revoir"
      subtitle="Connectez-vous en quelques secondes — sans mot de passe à retenir."
      quote="« Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. »"
      quoteRef="— Psaume 119:105"
      features={[
        { icon: Feather, text: "Un seul compte pour toute la communauté" },
        { icon: Lock, text: "Code sécurisé à usage unique par email" },
        { icon: MessageCircle, text: "Messagerie, dons, événements : tout réuni" },
      ]}
      footerNote="Église Temple du Dieu Vivant · Lomé, Togo"
    >
      {/* Indicateur d'étapes */}
      <div className="flex items-center mb-7">
        {["Votre email", "Code de vérification"].map((label, i) => (
          <div key={label} className={`flex items-center ${i === 0 ? "flex-1" : ""}`}>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  progress >= i
                    ? "bg-gold text-white shadow-[0_0_0_4px_rgba(55,205,190,.15)]"
                    : "bg-sand-2 border border-line text-soft"
                }`}
              >
                {progress > i ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={`hidden sm:inline text-[11px] font-mono uppercase tracking-wide whitespace-nowrap ${
                  progress === i ? "text-ink font-semibold" : progress > i ? "text-gold-dim" : "text-soft"
                }`}
              >
                {label}
              </span>
            </div>
            {i === 0 && (
              <div className={`mx-4 flex-1 h-px transition-colors ${progress > 0 ? "bg-gold" : "bg-line"}`} />
            )}
          </div>
        ))}
      </div>

      {step === STEP_EMAIL && !passwordMode && (
        <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="card rounded-lg p-7">
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
            placeholder="marcellin@exemple.com"
          />

          <ErrorAlert message={error} />

          <Button type="submit" className="w-full mt-5" disabled={loading || !email.trim()}>
            {loading ? "Envoi en cours…" : "Recevoir mon code"}
            {!loading && <ArrowRight size={16} className="ml-2" />}
          </Button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs font-mono text-soft">OU</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={() => { setPasswordMode(true); setPasswordError(null); }}>
            <Lock size={15} className="mr-2" />
            Se connecter avec un mot de passe
          </Button>
        </form>
      )}

      {step === STEP_EMAIL && passwordMode && (
        <form onSubmit={loginWithPassword} className="card rounded-lg p-7">
          <Input
            label="ADRESSE EMAIL"
            type="email"
            required
            autoFocus
            autoComplete="email"
            name="email"
            disabled={passwordLoading}
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="marcellin@exemple.com"
          />
          <Input
            label="MOT DE PASSE"
            type="password"
            required
            autoComplete="current-password"
            name="password"
            disabled={passwordLoading}
            icon={<KeyRound size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            className="mt-1"
          />

          <ErrorAlert message={passwordError} />

          <Button type="submit" className="w-full mt-5" disabled={passwordLoading || !email.trim() || !password}>
            {passwordLoading ? "Connexion…" : "Se connecter"}
            {!passwordLoading && <ArrowRight size={16} className="ml-2" />}
          </Button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs font-mono text-soft">OU</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={() => { setPasswordMode(false); setPassword(""); setPasswordError(null); }}>
            <Mail size={15} className="mr-2" />
            Recevoir un code par email
          </Button>

          <p className="text-xs text-soft mt-4 text-center">
            Mot de passe oublié ou non défini&nbsp;?
            <button type="button" onClick={() => { setPasswordMode(false); setPasswordError(null); }} className="text-gold-dim font-semibold hover:underline ml-1">
              Utilisez le code par email
            </button>
          </p>
        </form>
      )}

      {step === STEP_CODE && (
        <form onSubmit={(e) => { e.preventDefault(); verifyOtp(); }} className="card rounded-lg p-7">
          <div className="flex items-center gap-2 text-xs font-mono text-soft mb-1">
            <KeyRound size={13} className="text-gold-dim" />
            CODE ENVOYÉ À <span className="text-ink">{email}</span>
          </div>
          <p className="text-xs text-soft mt-2">
            Saisissez les 6 chiffres reçus par email. Le code expire au bout de quelques minutes.
          </p>

          <div className="mt-5">
            <OtpInput value={code} onChange={setCode} disabled={loading} />
          </div>

          {isNewUser && (
            <div className="mt-6 pt-6 border-t border-line">
              <p className="text-xs font-mono mb-3 text-soft">PREMIÈRE CONNEXION — COMPLÉTEZ VOTRE PROFIL</p>
              <div className="grid grid-cols-2 gap-3">
                <Input required placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input required placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <Input className="mt-3" placeholder="Téléphone (optionnel)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          )}

          <ErrorAlert message={error} />

          <Button type="submit" className="w-full mt-5" disabled={loading || code.length < 6}>
            {loading ? "Vérification…" : "Valider et continuer"}
            {!loading && <ArrowRight size={16} className="ml-2" />}
          </Button>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button type="button" onClick={backToEmail} className="text-xs text-soft hover:text-ink transition">
              ← Modifier l'email
            </button>
            <span className="text-line">|</span>
            <button
              type="button"
              onClick={resend}
              disabled={loading}
              className="text-xs font-semibold text-gold-dim hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Renvoyer le code
            </button>
          </div>
          {resent && (
            <p className="text-xs text-palm text-center mt-3 inline-flex items-center gap-1 w-full justify-center">
              <CheckCircle2 size={13} /> Code renvoyé — vérifiez votre boîte de réception.
            </p>
          )}
        </form>
      )}

      <p className="text-center text-xs mt-5 text-soft">
        En continuant, vous acceptez les conditions d'utilisation de la communauté ETDV.
      </p>
    </AuthShell>
  );
}
