import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export const NAV_ITEMS = [
  { id: "market", label: "Market" },
  { id: "cohorts", label: "Cohorts" },
  { id: "rescue", label: "Rescue" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "experiments", label: "Experiments" },
  { id: "clv", label: "CLV" },
  { id: "hci", label: "HCI Lab" },
  { id: "strategist", label: "Strategist" },
  { id: "roadmap", label: "Roadmap" },
];

export default function Nav() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
      let current = "";
      NAV_ITEMS.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < 140) current = n.id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header data-testid="site-nav" className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <button data-testid="nav-home-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-baseline gap-2 text-left">
          <span className="font-serif text-xl font-semibold italic text-espresso">TheRetentionLab<span className="font-normal">- by Hamda</span></span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-sagedeep sm:inline">Independent concept</span>
        </button>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Sections">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              data-testid={`nav-link-${n.id}`}
              onClick={() => go(n.id)}
              className={`rounded-full px-3 py-1.5 text-[13px] transition-[background-color,color] duration-300 ${active === n.id ? "bg-espresso text-ivory" : "text-cocoa hover:bg-linen"}`}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <button data-testid="nav-mobile-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-full border border-line p-2 xl:hidden">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <div className="h-[2px] bg-transparent">
        <div data-testid="nav-progress-bar" className="h-full bg-sagedeep transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
      {open && (
        <nav data-testid="nav-mobile-menu" className="border-t border-line bg-ivory px-5 pb-6 pt-2 xl:hidden">
          {NAV_ITEMS.map((n, i) => (
            <button key={n.id} data-testid={`nav-mobile-link-${n.id}`} onClick={() => go(n.id)} className="flex w-full items-baseline gap-4 border-b border-line py-3 text-left">
              <span className="font-mono text-[10px] text-sagedeep">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-serif text-2xl text-espresso">{n.label}</span>
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
