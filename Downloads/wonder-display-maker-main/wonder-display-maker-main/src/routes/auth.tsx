import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (mode: "signin" | "signup") => {
    if (!email || password.length < 6) {
      toast.error("Enter a valid email and password (6+ chars).");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        // Auto-grant admin role to first signup; subsequent ones become regular users
        if (data.user) {
          const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
          if ((count ?? 0) === 0) {
            await supabase.from("user_roles").insert({ user_id: data.user.id, role: "admin" });
            toast.success("Account created. You are the admin!");
          } else {
            toast.success("Account created.");
          }
        }
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
        navigate({ to: "/admin" });
      }
    } catch (e: any) {
      toast.error(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="font-display text-3xl text-gold">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage properties</p>
        </div>

        <div className="p-6 border border-border rounded-lg bg-card">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            {(["signin", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                </div>
                <Button onClick={() => handle(mode)} disabled={loading} className="w-full bg-gradient-gold text-primary-foreground">
                  {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
                </Button>
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground text-center">First account becomes admin automatically.</p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
