
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plane, Mail, Lock, Loader2 } from "lucide-react";
import logoTransparent from "@/assets/logo-connect-voos-transparent.png";

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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--auth-background))] via-[hsl(var(--auth-background-secondary))] to-[hsl(var(--auth-background))] flex justify-center items-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border border-white/20 bg-[hsl(var(--auth-card))]/20 backdrop-blur-lg relative overflow-hidden">
        {/* Card header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/40 via-white/60 to-white/40"></div>
        
        <CardHeader className="space-y-6 text-center pt-8">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-125 animate-pulse"></div>
            <img 
              src={logoTransparent} 
              alt="Connect Voos" 
              className="h-24 w-auto mx-auto relative z-10 drop-shadow-2xl filter brightness-110"
            />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold text-[hsl(var(--auth-text-primary))] drop-shadow-lg">
              Connect Voos
            </CardTitle>
            <CardDescription className="text-[hsl(var(--auth-text-secondary))]/90 text-lg font-medium">
              {mode === "login"
                ? "Acesse seu sistema de gestão"
                : "Crie sua conta no sistema"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-6">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center gap-2 text-[hsl(var(--auth-text-primary))] font-medium text-sm">
                <Mail className="h-4 w-4 text-white/80" />
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-12 bg-white/95 border-white/30 text-gray-900 placeholder:text-gray-500 focus:border-white focus:ring-white/30 transition-all duration-300 shadow-lg"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="flex items-center gap-2 text-[hsl(var(--auth-text-primary))] font-medium text-sm">
                <Lock className="h-4 w-4 text-white/80" />
                Senha
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-12 bg-white/95 border-white/30 text-gray-900 placeholder:text-gray-500 focus:border-white focus:ring-white/30 transition-all duration-300 shadow-lg"
              />
            </div>
            {errorMsg && (
              <div className="text-red-100 text-sm p-4 bg-red-500/20 rounded-lg border border-red-400/30 backdrop-blur-sm">
                {errorMsg}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 mt-8 bg-white/20 hover:bg-white/30 text-[hsl(var(--auth-text-primary))] font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-white/30 backdrop-blur-sm" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span className="text-white">{mode === "login" ? "Autenticando..." : "Criando conta..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5 text-white" />
                  <span className="text-white">{mode === "login" ? "Entrar" : "Criar conta"}</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pb-8">
          <Button
            type="button"
            variant="ghost"
            className="text-sm h-auto font-normal text-[hsl(var(--auth-text-secondary))]/80 hover:text-[hsl(var(--auth-text-primary))] transition-colors hover:bg-white/10"
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
