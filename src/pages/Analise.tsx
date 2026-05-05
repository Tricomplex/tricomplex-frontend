import { useCallback, useState } from "react";
import {
  Upload, FileCode, Loader2, CheckCircle2, AlertCircle,
  ExternalLink, Calendar, MapPin, Receipt, RotateCcw, FileText, ShieldCheck, Info,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { mockAnalyzeNFe, NFeAnalysisResult, AliquotaItem } from "@/lib/api";

type Status = "idle" | "loading" | "done" | "error";

const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const confidenceConfig = {
  alta: { label: "Confiança alta", color: "bg-accent-soft text-accent border-accent/30" },
  media: { label: "Confiança média", color: "bg-warning-soft text-warning border-warning/30" },
  baixa: { label: "Confiança baixa", color: "bg-destructive/10 text-destructive border-destructive/30" },
} as const;

const aliquotaTypeColors: Record<AliquotaItem["type"], string> = {
  ICMS: "from-blue-500 to-blue-700",
  IBS: "from-emerald-500 to-emerald-700",
  CBS: "from-cyan-500 to-cyan-700",
  PIS: "from-violet-500 to-violet-700",
  COFINS: "from-fuchsia-500 to-fuchsia-700",
  IPI: "from-orange-500 to-orange-700",
  ISS: "from-pink-500 to-pink-700",
};

const Analise = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<NFeAnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xml")) {
      toast({
        title: "Formato inválido",
        description: "Envie um arquivo .xml de NF-e.",
        variant: "destructive",
      });
      return;
    }
    setFileName(file.name);
    setStatus("loading");
    setResult(null);
    try {
      const r = await mockAnalyzeNFe(file);
      setResult(r);
      setStatus("done");
      toast({
        title: "Análise concluída",
        description: `${r.products.length} produto(s) processado(s).`,
      });
    } catch {
      setStatus("error");
      toast({ title: "Erro ao analisar NF-e", variant: "destructive" });
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="container py-10 md:py-14">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Analisar NF-e
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-2">
            Envie sua nota fiscal eletrônica
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Faça upload do XML e em segundos você terá todas as alíquotas aplicáveis,
            com a justificativa e a fonte oficial de cada uma.
          </p>
        </div>

        {/* Upload */}
        {status !== "done" && (
          <Card className="overflow-hidden border-2 border-dashed transition-base animate-scale-in"
            style={{ borderColor: dragOver ? "hsl(var(--primary))" : undefined }}
          >
            <label
              htmlFor="nfe-upload"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center p-12 md:p-16 cursor-pointer transition-base ${
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
                    Identificando produtos, consultando bases de alíquotas e cruzando com fontes oficiais.
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
                  <h3 className="font-display text-xl font-bold">
                    Arraste o XML aqui ou clique para selecionar
                  </h3>
                  <p className="mt-2 text-muted-foreground text-center max-w-md">
                    Aceitamos arquivos <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">.xml</code> de NF-e.
                    Seus dados não saem do servidor sem criptografia.
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

        {/* Resultado */}
        {status === "done" && result && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Resumo da NF-e */}
            <Card className="bg-gradient-card shadow-soft overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold">Análise concluída</h2>
                    <p className="text-xs text-muted-foreground">
                      Processado em {new Date(result.analyzedAt).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="h-4 w-4" /> Nova análise
                </Button>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-4">
                <InfoCell icon={Receipt} label="NF-e" value={`Nº ${result.nfeNumber}`} />
                <InfoCell icon={MapPin} label="Origem" value={`${result.city}/${result.state}`} />
                <InfoCell icon={Calendar} label="Emissão" value={new Date(result.emittedAt).toLocaleDateString("pt-BR")} />
                <InfoCell icon={FileText} label="Total" value={formatBRL(result.totalValue)} highlight />
              </div>
              <div className="px-6 pb-6">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Emitente</div>
                <div className="text-sm font-medium">{result.issuer}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1">Destinatário</div>
                <div className="text-sm font-medium">{result.recipient}</div>
              </div>
            </Card>

            {/* Resumo IA */}
            <Card className="bg-primary-soft/50 border-primary/20 p-6">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-hero text-primary-foreground">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">Resumo da análise</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            </Card>

            {/* Produtos */}
            <div>
              <h2 className="font-display text-2xl font-extrabold mb-4">
                Produtos analisados ({result.products.length})
              </h2>
              <div className="space-y-4">
                {result.products.map((p, idx) => (
                  <Card key={p.code} className="overflow-hidden shadow-soft">
                    <div className="bg-gradient-card p-6 border-b border-border/60">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              #{idx + 1} • {p.code}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-xs">
                              NCM {p.ncm}
                            </Badge>
                          </div>
                          <h3 className="font-display text-lg font-bold mt-2">{p.description}</h3>
                          <div className="text-sm text-muted-foreground mt-1">
                            {p.quantity} un × {formatBRL(p.unitPrice)} ={" "}
                            <span className="font-semibold text-foreground">
                              {formatBRL(p.quantity * p.unitPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {p.aliquotas.map((a) => (
                        <AliquotaCard key={a.type} aliquota={a} />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <Card className="p-8 text-center border-destructive/30 bg-destructive/5">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="font-display font-bold">Não foi possível analisar a NF-e</h3>
            <Button variant="outline" className="mt-4" onClick={reset}>Tentar novamente</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

function InfoCell({
  icon: Icon, label, value, highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${
        highlight ? "bg-gradient-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={`font-bold ${highlight ? "text-accent" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function AliquotaCard({ aliquota }: { aliquota: AliquotaItem }) {
  const conf = confidenceConfig[aliquota.confidence];
  const gradient = aliquotaTypeColors[aliquota.type];

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden hover:shadow-soft transition-base">
      <div className="flex items-stretch">
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradient} text-white px-5 py-4 min-w-[110px]`}>
          <div className="text-xs font-bold uppercase tracking-wider opacity-90">{aliquota.type}</div>
          <div className="font-display text-3xl font-extrabold mt-1">
            {aliquota.rate}<span className="text-lg">%</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <Badge variant="outline" className={`text-xs ${conf.color}`}>
              <ShieldCheck className="h-3 w-3 mr-1" />
              {conf.label}
            </Badge>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{aliquota.basis}</p>

          <Separator className="my-3" />

          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Fontes
            </div>
            <div className="flex flex-wrap gap-2">
              {aliquota.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:border-primary hover:bg-primary-soft transition-base"
                >
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">
                    • {new Date(s.publishedAt).toLocaleDateString("pt-BR")}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analise;
