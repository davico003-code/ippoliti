"use client";

import { useEffect, useState, type MouseEvent } from "react";

// Sub-nav sticky con scroll-spy (subrayado verde en la sección activa) + scroll
// suave. Se pega debajo del navbar global (sticky, ~52px mobile / ~64px desktop).
// Solo renderiza los ítems cuyas secciones existen (se pasan por props).

const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

export interface SubnavItem {
  id: string;
  label: string;
}

export default function DetalleSubnav({ items }: { items: SubnavItem[] }) {
  const [activo, setActivo] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const secs = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    if (secs.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActivo(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    secs.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [items]);

  const jump = (e: MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Secciones del barrio"
      className="sticky z-40 border-b border-black/10 bg-white/92 backdrop-blur-md top-[calc(env(safe-area-inset-top,0px)+52px)] md:top-[64px]"
    >
      <ul className="mx-auto flex max-w-[1180px] gap-7 overflow-x-auto px-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => {
          const on = activo === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => jump(e, it.id)}
                className={`block whitespace-nowrap border-b-2 py-4 text-[14px] transition-colors ${
                  on
                    ? "border-[#1A5C38] font-semibold text-[#1A5C38]"
                    : "border-transparent font-medium text-[#5C6B62] hover:text-[#0E1A14]"
                }`}
                style={{ fontFamily: P }}
                aria-current={on ? "true" : undefined}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
