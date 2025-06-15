
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sky-100 to-sky-200">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Agência de Viagens</CardTitle>
          <CardDescription className="text-center">
            {mode === "login"
              ? "Entre com suas credenciais"
              : "Preencha para criar sua conta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (mode === "login" ? "Autenticando..." : "Criando conta...")
                : (mode === "login" ? "Entrar" : "Criar conta")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="button"
            variant="link"
            className="text-xs p-0"
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
