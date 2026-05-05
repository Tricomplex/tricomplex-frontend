import { Link } from "react-router-dom";
import { ArrowRight, FileSearch, ShieldCheck, Sparkles, Clock, FileCheck2, Database, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroImg from "@/assets/hero.jpg";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: FileCheck2,
    title: "Envie sua NF-e",
    description: "Faça upload do XML da nota fiscal eletrônica. Suportamos múltiplos produtos por nota.",
  },
  {
    icon: Sparkles,
    title: "IA analisa cada item",
    description: "Identificamos NCM, operação, estado e município para definir as alíquotas aplicáveis.",
  },
  {
    icon: Database,
    title: "Bases atualizadas diariamente",
    description: "Lemos o Diário Oficial todos os dias. Suas alíquotas estão sempre vigentes.",
  },
  {
    icon: BookOpenCheck,
    title: "Sempre com a fonte",
    description: "Cada alíquota vem com link direto para o decreto, RICMS, portaria ou protocolo.",
  },
];

const stats = [
  { value: "27", label: "Estados monitorados" },
  { value: "1×/dia", label: "Atualização do DO" },
  { value: "< 5s", label: "Análise por NF-e" },
  { value: "100%", label: "Com fonte oficial" },
];

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-xs font-semibold text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Reforma Tributária • IBS, CBS, ICMS e Imposto Seletivo
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Alíquotas tributárias{" "}
                <span className="bg-gradient-hero bg-clip-text text-white">
                  atualizadas
                </span>
                , direto da sua NF-e.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Envie o XML da nota fiscal e receba, em segundos, todas as alíquotas
                aplicáveis com a justificativa e a fonte oficial de cada uma.
                Nada de caçar decreto no Diário Oficial.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" size="xl" asChild>
                  <Link to={isAuthenticated ? "/analise" : "/login?mode=signup"}>
                    Analisar uma NF-e
                    <ArrowRight className="ml-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <a href="#como-funciona">Como funciona</a>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Fontes oficiais
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Atualizado diariamente
                </div>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-2xl rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-elevated border border-border/60">
                <img
                  src={heroImg}
                  alt="Análise automatizada de notas fiscais com inteligência artificial"
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border/60 bg-card">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-extrabold text-primary">
                  {s.value}
                </div>
                <div className="mt-1 text-xs md:text-sm uppercase tracking-wider text-muted-foreground font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="container py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Como funciona
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold mt-3">
            Quatro passos. Zero planilhas.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Construído por contadores, para contadores. Você envia, a IA faz o resto.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-border bg-gradient-card p-6 shadow-soft hover:shadow-elevated hover:-translate-y-1 transition-smooth"
            >
              <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-hero text-xs font-bold text-primary-foreground shadow-glow">
                {i + 1}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary mb-4 group-hover:scale-110 transition-base">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-center shadow-elevated">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative">
            <FileSearch className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground">
              Pronto pra parar de caçar decreto?
            </h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Crie sua conta gratuita e analise sua primeira nota fiscal agora.
            </p>
            <Button variant="accent" size="xl" className="mt-8" asChild>
              <Link to={isAuthenticated ? "/analise" : "/login?mode=signup"}>
                Começar agora <ArrowRight className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
