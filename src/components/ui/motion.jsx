import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Animations d'entrée — mêmes codes que le hero de la page d'accueil :
 * apparition en fondu + remontée, en cascade (stagger).
 *
 * <Stagger inView>   conteneur : se déclenche à l'entrée dans le viewport
 * <Item>             élément animé (fondu + y:24)
 *
 * Le déclenchement n'utilise PAS whileInView (bug connu framer-motion avec la
 * navigation client + StrictMode : l'observer ne se déclenche jamais) : on
 * pilote l'animation via le hook useInView + un garde-fou manuel (scroll/resize)
 * qui force l'affichage dès que la section approche du viewport.
 */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

function useReveal() {
  const ref = useRef(null);
  const ioInView = useInView(ref, { once: true, amount: 0.15 });
  const [fallbackSeen, setFallbackSeen] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.15 && rect.bottom > 0) {
        setFallbackSeen(true);
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    };
    const t = setTimeout(check, 150);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return { ref, show: fallbackSeen || ioInView };
}

export function Stagger({ children, className = "", delay = 0, stagger = 0.07, as = "div", inView = false }) {
  const Comp = motion[as] ?? motion.div;
  const { ref, show } = useReveal();
  return (
    <Comp
      ref={inView ? ref : undefined}
      className={className}
      initial="hidden"
      animate={inView ? (show ? "show" : "hidden") : "show"}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
}

export function Item({ children, className = "" }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}