import { useCallback, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Loader2,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { analyzeNFe, FriendlyItemReport, FriendlyReport, FriendlyTaxReport, NFeFriendlyResponse } from "@/lib/api";

type Status = "idle" | "loading" | "done" | "error";

const statusConfig = {
  ok: { label: "OK", className: "bg-accent-soft text-accent border-accent/30" },
  divergente: { label: "Divergente", className: "bg-destructive/10 text-destructive border-destructive/30" },
  sem_regra: { label: "Sem regra", className: "bg-warning-soft text-warning border-warning/30" },
  sem_imposto_na_nfe: { label: "Nao declarado", className: "bg-secondary text-muted-foreground border-border" },
  revisao_manual: { label: "Revisao manual", className: "bg-warning-soft text-warning border-warning/30" },
} as const;

const formatBRL = (value: number | null | undefined) =>
  value == null ? "-" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const Analise = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [response, setResponse] = useState<NFeFriendlyResponse | null>(null);
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
    setResponse(null);
    setErrorMessage("");
    setStatus("loading");

    try {
      const result = await analyzeNFe(file);
      setResponse(result);
      setAnalyzedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      setStatus("done");
      toast({
        title: "Analise concluida",
        description: `${result.dados.resumo.total_itens} item(ns) processado(s).`,
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
    setResponse(null);
    setErrorMessage("");
    setAnalyzedAt("");
  };

  const downloadMarkdown = () => {
    if (!response) return;
    const blob = new Blob([buildMarkdown(response.relatorio)], { type: "text/markdown;charset=utf-8" });
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
            Faca upload do XML e receba uma analise amigavel, estruturada e com fontes legais.
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
                    Extraindo o XML, consultando regras e organizando a explicacao com IA.
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
                    O relatorio podera ser baixado em Markdown.
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

        {status === "done" && response && (
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

              <div className="grid gap-4 p-5 md:grid-cols-4 md:p-6">
                <InfoCell label="NF-e" value={response.dados.cabecalho.numero || "-"} />
                <InfoCell label="Emissao" value={formatDate(response.dados.cabecalho.data_emissao)} />
                <InfoCell label="Itens" value={String(response.dados.resumo.total_itens)} />
                <InfoCell label="Total" value={formatBRL(response.dados.cabecalho.valor_total)} highlight />
              </div>
            </Card>

            <FriendlyReportView report={response.relatorio} />
          </section>
        )}

        {status === "error" && (
          <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="font-display font-bold">Nao foi possivel analisar a NF-e</h3>
            {errorMessage && <p className="mt-2 text-sm text-muted-foreground break-words">{errorMessage}</p>}
            <Button variant="outline" className="mt-4" onClick={reset}>
              Tentar novamente
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

function InfoCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-4">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`mt-1 font-bold ${highlight ? "text-accent" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function FriendlyReportView({ report }: { report: FriendlyReport }) {
  return (
    <>
      <Card className="p-5 md:p-6">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h2 className="font-display text-xl font-extrabold">{report.titulo}</h2>
        </div>
        <p className="text-sm leading-7 text-foreground/85 md:text-base">{report.resumo_executivo}</p>
      </Card>

      <Card className="p-5 md:p-6">
        <h2 className="font-display text-xl font-extrabold">Pontos de atencao</h2>
        {report.pontos_atencao.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nao foram encontrados alertas relevantes.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {report.pontos_atencao.map((point, index) => (
              <div key={`${point.item}-${point.tributo}-${index}`} className="rounded-lg border border-border bg-secondary/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {point.item && <Badge variant="outline">Item {point.item}</Badge>}
                  {point.tributo && <Badge variant="outline">{point.tributo}</Badge>}
                  <StatusBadge status={point.status} />
                </div>
                <p className="mt-2 text-sm leading-6">{point.mensagem}</p>
                {(point.declarado || point.correto || point.diferenca) && (
                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                    <MiniBox label="Declarado" value={point.declarado} />
                    <MiniBox label="Correto esperado" value={point.correto} />
                    <MiniBox label="Diferenca" value={point.diferenca} />
                  </div>
                )}
                {point.fonte && <p className="mt-3 text-xs text-muted-foreground">{point.fonte}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="font-display text-2xl font-extrabold">Itens analisados</h2>
        {report.itens.map((item) => (
          <FriendlyItemCard key={item.numero_item} item={item} />
        ))}
      </div>

      <Card className="p-5 md:p-6">
        <h2 className="font-display text-xl font-extrabold">Fontes utilizadas</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {report.fontes.map((source) =>
            source.url ? (
              <a
                key={`${source.titulo}-${source.url}`}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-primary hover:bg-primary-soft"
              >
                <FileText className="h-3.5 w-3.5" />
                {source.titulo}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span key={source.titulo} className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-medium">
                {source.titulo}
              </span>
            ),
          )}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">{report.observacao}</p>
      </Card>
    </>
  );
}

function FriendlyItemCard({ item }: { item: FriendlyItemReport }) {
  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="border-b border-border/60 bg-gradient-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Item {item.numero_item}</Badge>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold">{item.titulo}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.resumo}</p>
      </div>
      <div className="divide-y divide-border">
        {item.tributos.map((tax) => (
          <TaxRow key={tax.tributo} tax={tax} />
        ))}
      </div>
    </Card>
  );
}

function TaxRow({ tax }: { tax: FriendlyTaxReport }) {
  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[120px_1fr]">
      <div>
        <div className="font-bold">{tax.tributo}</div>
        <StatusBadge status={tax.status} className="mt-2" />
      </div>
      <div>
        <p className="text-sm leading-6">{tax.explicacao}</p>
        {(tax.declarado || tax.correto || tax.diferenca) && (
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            <MiniBox label="Declarado" value={tax.declarado} />
            <MiniBox label="Correto esperado" value={tax.correto} />
            <MiniBox label="Diferenca" value={tax.diferenca} />
          </div>
        )}
        {tax.fonte && <p className="mt-3 text-xs text-muted-foreground">{tax.fonte}</p>}
      </div>
    </div>
  );
}

function MiniBox({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md bg-background p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-secondary text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
}

function buildMarkdown(report: FriendlyReport) {
  const lines = [`# ${report.titulo}`, "", report.resumo_executivo, "", "## Pontos de atencao", ""];

  if (report.pontos_atencao.length === 0) {
    lines.push("Nao foram encontrados alertas relevantes.", "");
  } else {
    report.pontos_atencao.forEach((point) => {
      lines.push(`- ${point.item ? `Item ${point.item} - ` : ""}${point.tributo || ""}: ${point.mensagem}`);
      if (point.declarado) lines.push(`  - Declarado: ${point.declarado}`);
      if (point.correto) lines.push(`  - Correto esperado: ${point.correto}`);
      if (point.diferenca) lines.push(`  - Diferenca: ${point.diferenca}`);
      if (point.fonte) lines.push(`  - Fonte: ${point.fonte}`);
    });
    lines.push("");
  }

  lines.push("## Itens analisados", "");
  report.itens.forEach((item) => {
    lines.push(`### Item ${item.numero_item} - ${item.titulo}`, "", item.resumo, "");
    item.tributos.forEach((tax) => {
      lines.push(`- **${tax.tributo} (${tax.status})**: ${tax.explicacao}`);
      if (tax.declarado) lines.push(`  - Declarado: ${tax.declarado}`);
      if (tax.correto) lines.push(`  - Correto esperado: ${tax.correto}`);
      if (tax.diferenca) lines.push(`  - Diferenca: ${tax.diferenca}`);
      if (tax.fonte) lines.push(`  - Fonte: ${tax.fonte}`);
    });
    lines.push("");
  });

  lines.push("## Fontes utilizadas", "");
  report.fontes.forEach((source) => {
    lines.push(`- ${source.url ? `[${source.titulo}](${source.url})` : source.titulo}`);
  });
  lines.push("", "## Observacao", "", report.observacao, "");
  return lines.join("\n");
}

export default Analise;
