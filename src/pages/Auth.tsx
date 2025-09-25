
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex justify-center items-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
        {/* Card header decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-sky-500"></div>
        
        <CardHeader className="space-y-6 text-center pt-8">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl scale-110"></div>
            <img 
              src="/assets/logo-connect-voos.png" 
              alt="Connect Voos" 
              className="h-20 w-auto mx-auto relative z-10 drop-shadow-lg"
            />
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
              Connect Voos
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              {mode === "login"
                ? "Acesse seu sistema de gestão"
                : "Crie sua conta no sistema"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-6">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
                <Mail className="h-4 w-4 text-blue-500" />
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="flex items-center gap-2 text-gray-700 font-medium">
                <Lock className="h-4 w-4 text-blue-500" />
                Senha
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-12 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
              />
            </div>
            {errorMsg && (
              <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-12 mt-8 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {mode === "login" ? "Autenticando..." : "Criando conta..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  {mode === "login" ? "Entrar" : "Criar conta"}
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pb-8">
          <Button
            type="button"
            variant="ghost"
            className="text-sm h-auto font-normal text-gray-600 hover:text-blue-600 transition-colors"
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
