import { Component } from "react";

function ErrorScreen({ message, onReload }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand px-6">
      <div className="card max-w-md w-full p-8 text-center">
        <p className="text-4xl mb-4">🕊️</p>
        <h1 className="font-display text-2xl">Oups, une erreur est survenue</h1>
        <p className="text-sm text-soft mt-2">
          Un imprévu a interrompu l'affichage de cette page. Rechargez pour continuer.
        </p>
        {message && <p className="font-mono text-xs text-brick mt-4 break-words">{message}</p>}
        <button onClick={onReload} className="btn btn-gold w-full mt-6">
          Recharger la page
        </button>
      </div>
    </div>
  );
}

/** Intercepte les erreurs de rendu et affiche un écran de secours au lieu d'un écran blanc. */
export default class ErrorBoundary extends Component {
  state = { hasError: false, message: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? null };
  }

  componentDidCatch(error, info) {
    // Point d'entrée pour un éventuel monitoring (Sentry, …)
    console.error("ErrorBoundary a intercepté une erreur :", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorScreen message={this.state.message} onReload={this.handleReload} />;
    }
    return this.props.children;
  }
}