import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Aura Unisex Salon" },
      { name: "description", content: "Create your Aura Unisex Salon account." },
      { property: "og:title", content: "Sign Up — Aura Unisex Salon" },
      { property: "og:description", content: "Create your Aura Unisex Salon account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (f.name.trim().length < 2) return toast.error("Enter your full name");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast.error("Enter a valid email");
    if (f.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (f.password !== f.confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: f.email,
      password: f.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: f.name.trim() } },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
  }

  if (sent)
    return (
      <AuthCard eyebrow="Almost there" title="Check your email">
        <p className="text-sm text-muted-foreground">We sent a confirmation link to {f.email}. Click it, then log in.</p>
        <Button asChild variant="luxe" size="lg" className="mt-6 w-full"><Link to="/login">Go to Login</Link></Button>
      </AuthCard>
    );

  return (
    <AuthCard eyebrow="Join Aura" title="Sign Up">
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={f.name} onChange={set("name")} autoComplete="name" /></div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={f.password} onChange={set("password")} autoComplete="new-password" /></div>
        <div className="space-y-2"><Label htmlFor="confirm">Confirm Password</Label><Input id="confirm" type="password" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" /></div>
        <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create Account"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-foreground underline underline-offset-4">Login</Link>
      </p>
    </AuthCard>
  );
}
