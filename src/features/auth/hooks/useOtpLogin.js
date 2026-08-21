import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../../api/auth.api";
import { useAuthStore } from "../../../store/authStore";

const STEP_EMAIL = "email";
const STEP_CODE = "code";

/**
 * Flux de connexion par code OTP (2 étapes : email → code + profil si premier accès).
 * Encapsule l'état, les erreurs et la navigation. Utilisé par ConnexionPage.
 */
export function useOtpLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginSuccess = useAuthStore((s) => s.loginSuccess);

  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const normalizeEmail = (value) => value.trim().toLowerCase();

  const sendOtp = useCallback(async () => {
    const normalized = normalizeEmail(email);
    setEmail(normalized);
    setError(null);
    setCode("");
    setIsNewUser(false);
    setLoading(true);
    try {
      await authApi.sendOtp(normalized);
      setStep(STEP_CODE);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'envoyer le code, réessayez.");
    } finally {
      setLoading(false);
    }
  }, [email]);

  const verifyOtp = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.verifyOtp({ email, code, firstName, lastName, phone });
      loginSuccess({ user: res.data.user, accessToken: res.data.accessToken });
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "";
      if (message.toLowerCase().includes("prénom")) setIsNewUser(true);
      setError(message || "Code invalide, réessayez.");
    } finally {
      setLoading(false);
    }
  }, [email, code, firstName, lastName, phone, loginSuccess, navigate, location.state?.from?.pathname]);

  const backToEmail = useCallback(() => {
    setStep(STEP_EMAIL);
    setCode("");
    setIsNewUser(false);
    setError(null);
  }, []);

  return {
    step,
    email, setEmail,
    code, setCode,
    firstName, setFirstName,
    lastName, setLastName,
    phone, setPhone,
    isNewUser,
    error,
    loading,
    sendOtp,
    verifyOtp,
    backToEmail,
  };
}