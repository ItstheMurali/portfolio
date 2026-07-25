"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "#work", label: "Work" },
  { href: "#architecture", label: "Architecture" },
  { href: "#tools", label: "Tools" },
  { href: "#films", label: "Films" },
  { href: "#contact", label: "Contact" },
];

interface LenisLike {
  scrollTo: (
    target: string | number,
    opts?: { offset?: number; duration?: number }
  ) => void;
}

/* Scroll through Lenis so navigation glides instead of jumping. */
function goTo(hash: string) {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis) {
    lenis.scrollTo(hash, { offset: -64, duration: 1.6 });
  } else {
    document
      .querySelector(hash)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default function Nav() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onComplete = () => setShown(true);
    window.addEventListener("hero:complete", onComplete);
    // fallback: show nav after 10s regardless
    const t = setTimeout(() => setShown(true), 10000);
    return () => {
      window.removeEventListener("hero:complete", onComplete);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const ids = links.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [shown]);

  if (!shown) return null;

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-[95] flex items-center justify-between px-5 py-4 md:px-10"
        style={{
          background: "rgba(11,10,9,0.85)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <a
          href="#storm"
          onClick={(e) => {
            e.preventDefault();
            goTo("#storm");
          }}
          className="font-syne text-lg font-bold tracking-widest text-pen"
          aria-label="Back to top"
        >
          MK
        </a>

        {/* desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                goTo(l.href);
              }}
              className={`label font-mono text-[11px] transition-colors ${
                active === l.href.slice(1)
                  ? "text-pen underline decoration-pen underline-offset-8"
                  : "text-human/60 hover:text-human"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* mobile hamburger */}
        <button
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <span className="h-px w-6 bg-human" />
          <span className="h-px w-6 bg-human" />
        </button>
      </motion.nav>

      {/* mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99] flex flex-col items-center justify-center"
            style={{
              background: "rgba(11,10,9,0.97)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center text-2xl text-human"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  goTo(l.href);
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 * i,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`flex h-16 items-center font-syne text-[32px] font-bold ${
                  active === l.href.slice(1)
                    ? "text-pen underline decoration-pen underline-offset-8"
                    : "text-human"
                }`}
              >
                {l.label}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
