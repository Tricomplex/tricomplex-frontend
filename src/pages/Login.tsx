import { useState, FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FileSearch, Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();

  const isSignup = params.get("mode") === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    const next = new URLSearchParams(params);
    if (isSignup) next.delete("mode");
    else next.set("mode", "signup");
    setParams(next);
  };

  const getErrorMessage = (err: unknown) => {
    const error = err as { errors?: Array<{ longMessage?: string; message?: string }> };
    return (
      error.errors?.[0]?.longMessage ||
      error.errors?.[0]?.message ||
      "Tente novamente em instantes."
    );
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!signInLoaded || !signUpLoaded) return;

    setLoading(true);

    try {
      if (isSignup) {
        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName: name,
        });

        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });
          toast({ title: "Conta criada!", description: "Bem-vindo ao Tricomplex." });
          navigate("/analise");
          return;
        }

        toast({
          title: "Verificação necessária",
          description:
            "Sua conta foi criada, mas o Clerk pediu uma etapa extra de verificação. Podemos implementar essa tela depois.",
        });
      } else {
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
          toast({ title: "Login realizado", description: "Boa volta!" });
          navigate("/analise");
          return;
        }

        toast({
          title: "Verificação necessária",
          description:
            "O Clerk pediu uma etapa extra de autenticação. Podemos implementar essa tela depois.",
        });
      }
    } catch (err) {
      toast({
        title: "Algo deu errado",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Painel lateral visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary-glow/30 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground w-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <FileSearch className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-extrabold">Tricomplex</span>
          </Link>
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-extrabold leading-tight">
              "Em segundos, todas as alíquotas com a fonte oficial. Mudou nossa rotina."
            </h2>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold">
                MR
              </div>
              <div>
                <div className="font-semibold">Mariana R.</div>
                <div className="text-sm opacity-80">Contadora • Escritório em Campinas</div>
              </div>
            </div>
          </div>
          <div className="text-xs opacity-70">© {new Date().getFullYear()} Tricomplex</div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <FileSearch className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-extrabold">Tricomplex</span>
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            {isSignup ? "Criar conta" : "Bem-vindo de volta"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isSignup
              ? "Comece a analisar suas notas fiscais agora."
              : "Entre para analisar suas notas fiscais."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    className="pl-10 h-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contador@empresa.com"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignup ? "Criar conta" : "Entrar"} <ArrowRight />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              {isSignup ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-primary hover:underline"
              >
                {isSignup ? "Entrar" : "Criar conta"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            🔒 Autenticação protegida via Clerk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
