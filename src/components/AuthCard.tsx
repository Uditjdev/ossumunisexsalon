import type { ReactNode } from "react";

export function AuthCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 pb-16 pt-32">
      <div className="w-full max-w-md border border-border/60 bg-background p-8 shadow-sm sm:p-10">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl text-foreground">{title}</h1>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
