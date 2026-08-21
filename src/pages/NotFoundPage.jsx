import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-xs text-gold-dim">ERREUR 404</p>
      <h1 className="font-display text-4xl mt-3">Cette page n'existe pas</h1>
      <p className="text-sm text-soft mt-2">Elle a peut-être été déplacée ou supprimée.</p>
      <Button as={Link} to="/" className="mt-6">Retour à l'accueil</Button>
    </div>
  );
}
