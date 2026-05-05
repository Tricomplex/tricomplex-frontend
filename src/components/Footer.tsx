import { Link } from "react-router-dom";
import { FileSearch, Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card mt-24">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <FileSearch className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-extrabold">
                Tri<span className="text-primary">complex</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Acompanhamos o Diário Oficial todos os dias para que você não precise.
              Alíquotas tributárias atualizadas, com fontes verificáveis, direto da NF-e.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Produto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-base">Início</Link></li>
              <li><Link to="/analise" className="hover:text-foreground transition-base">Analisar NF-e</Link></li>
              <li><a href="#como-funciona" className="hover:text-foreground transition-base">Como funciona</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Contato</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contato@Tricomplex</li>
              <li className="flex items-center gap-2"><Github className="h-4 w-4" /> github.com/aliquota-ai</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Tricomplex — Todas as alíquotas exibidas são acompanhadas de suas fontes oficiais.
        </div>
      </div>
    </footer>
  );
}
