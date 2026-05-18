import { useCallback, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileCode,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { analyzeNFeMarkdown } from "@/lib/api";

type Status = "idle" | "loading" | "done" | "error";

const Analise = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analyzedAt, setAnalyzedAt] = useState("");

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xml")) {
      toast({
        title: "Formato invalido",
        description: "Envie um arquivo .xml de NF-e.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setMarkdown("");
    setErrorMessage("");
    setStatus("loading");

    try {
      const responseMarkdown = await analyzeNFeMarkdown(file);
      setMarkdown(responseMarkdown);
      setAnalyzedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      setStatus("done");
      toast({
        title: "Analise concluida",
        description: "A resposta em Markdown foi gerada com sucesso.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel analisar a NF-e.";
      setErrorMessage(message);
      setStatus("error");
      toast({
        title: "Erro ao analisar NF-e",
        description: message,
        variant: "destructive",
      });
    }
  }, []);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.currentTarget.value = "";
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStatus("idle");
    setFileName("");
    setMarkdown("");
    setErrorMessage("");
    setAnalyzedAt("");
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = fileName.replace(/\.xml$/i, "") || "analise-nfe";
    link.href = url;
    link.download = `${safeName}-resposta-tricomplex.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <main className="container py-10 md:py-14">
        <div className="mb-8 animate-fade-in">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Analisar NF-e
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-2">
            Envie sua nota fiscal eletronica
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Faca upload do XML e receba uma analise tributaria em linguagem clara,
            com divergencias, valores corretos e fontes legais quando disponiveis.
          </p>
        </div>

        {status !== "done" && (
          <Card
            className="overflow-hidden border-2 border-dashed transition-base animate-scale-in"
            style={{ borderColor: dragOver ? "hsl(var(--primary))" : undefined }}
          >
            <label
              htmlFor="nfe-upload"
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center p-10 md:p-16 cursor-pointer transition-base ${
                dragOver ? "bg-primary-soft" : "hover:bg-primary-soft/40"
              } ${status === "loading" ? "pointer-events-none" : ""}`}
            >
              {status === "loading" ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-hero rounded-full blur-2xl opacity-40 animate-pulse" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-hero shadow-glow">
                      <Loader2 className="h-9 w-9 text-primary-foreground animate-spin" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold mt-6">Analisando sua NF-e...</h3>
                  <p className="mt-2 text-muted-foreground text-center max-w-sm">
                    Extraindo o XML, consultando regras tributarias e preparando a resposta.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <FileCode className="h-4 w-4" /> {fileName}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary mb-6">
                    <Upload className="h-9 w-9" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-center">
                    Arraste o XML aqui ou clique para selecionar
                  </h3>
                  <p className="mt-2 text-muted-foreground text-center max-w-md">
                    Aceitamos arquivos <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">.xml</code> de NF-e.
                    A resposta sera exibida em Markdown e podera ser baixada.
                  </p>
                  <Button variant="hero" size="lg" className="mt-6" type="button" asChild>
                    <span>Selecionar arquivo</span>
                  </Button>
                  <input
                    id="nfe-upload"
                    type="file"
                    accept=".xml,text/xml,application/xml"
                    className="sr-only"
                    onChange={onInputChange}
                  />
                </>
              )}
            </label>
          </Card>
        )}

        {status === "done" && (
          <section className="space-y-6 animate-fade-in-up">
            <Card className="bg-gradient-card shadow-soft overflow-hidden">
              <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold">Analise concluida</h2>
                    <p className="text-xs text-muted-foreground">
                      {fileName} processado as {analyzedAt}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" onClick={downloadMarkdown}>
                    <Download className="h-4 w-4" /> Baixar resposta
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="h-4 w-4" /> Nova analise
                  </Button>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  Resposta gerada para revisao contabil
                </div>
                <MarkdownPreview markdown={markdown} />
              </div>
            </Card>
          </section>
        )}

        {status === "error" && (
          <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="font-display font-bold">Nao foi possivel analisar a NF-e</h3>
            {errorMessage && (
              <p className="mt-2 text-sm text-muted-foreground break-words">{errorMessage}</p>
            )}
            <Button variant="outline" className="mt-4" onClick={reset}>
              Tentar novamente
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

function MarkdownPreview({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <article className="max-w-none space-y-5 text-sm leading-7 text-foreground md:text-base">
      {blocks.map((block, index) => (
        <MarkdownBlock key={`${index}-${block.slice(0, 24)}`} block={block} />
      ))}
    </article>
  );
}

function MarkdownBlock({ block }: { block: string }) {
  if (block.startsWith("## ")) {
    return (
      <h2 className="font-display text-xl font-extrabold tracking-normal text-foreground md:text-2xl">
        {renderInline(block.replace(/^##\s+/, ""))}
      </h2>
    );
  }

  if (block.startsWith("# ")) {
    return (
      <h1 className="font-display text-2xl font-extrabold tracking-normal text-foreground md:text-3xl">
        {renderInline(block.replace(/^#\s+/, ""))}
      </h1>
    );
  }

  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const isList = lines.every((line) => /^[-*]\s+/.test(line));

  if (isList) {
    return (
      <ul className="space-y-2 rounded-lg border border-border bg-secondary/40 p-4">
        {lines.map((line, index) => (
          <li key={`${index}-${line}`} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{renderInline(line.replace(/^[-*]\s+/, ""))}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="rounded-lg bg-background/80 text-foreground/90">
      {renderInline(block.replace(/\n/g, " "))}
    </p>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={index}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
        >
          {link[1]}
          <FileText className="h-3.5 w-3.5" />
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export default Analise;
