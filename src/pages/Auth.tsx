
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plane, Mail, Lock, Loader2 } from "lucide-react";

type Mode = "login" | "signup";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Check session - redirect if authenticated
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && isMounted) {
        navigate("/dashboard", { replace: true });
      }
    });
    return () => { isMounted = false }
  }, [navigate]);

  // Handle auth state changes (redirect on login)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Login realizado", description: "Bem-vindo de volta!" });
      } else {
        // SIGNUP
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl }
        });
        if (error) throw error;
        toast({ title: "Cadastro realizado", description: "Verifique seu email para confirmar o cadastro." });
        setMode("login");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Erro inesperado");
      toast({ variant: "destructive", title: "Erro", description: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-6 text-center">
          <div className="mx-auto">
            <img 
              src="/assets/logo-connect-voos.png" 
              alt="Connect Voos" 
              className="h-16 w-auto mx-auto mb-4"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">Connect Voos</CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === "login"
                ? "Acesse seu sistema de gestão"
                : "Crie sua conta no sistema"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-11"
              />
            </div>
            {errorMsg && (
              <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-md border border-destructive/20">
                {errorMsg}
              </div>
            )}
            <Button type="submit" className="w-full h-11 mt-6" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "login" ? "Autenticando..." : "Criando conta..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="ghost"
            className="text-sm p-0 h-auto font-normal"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setErrorMsg(null);
            }}
          >
            {mode === "login"
              ? "Não tem uma conta? Cadastre-se"
              : "Já possui conta? Entrar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
