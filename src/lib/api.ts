const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type AnalysisStatus =
  | "ok"
  | "divergente"
  | "sem_regra"
  | "sem_imposto_na_nfe"
  | "revisao_manual";

export type TaxAnalysis = {
  tributo: string;
  status: AnalysisStatus;
  declarado: {
    cst: string | null;
    base_calculo: number | null;
    aliquota_percentual: number | null;
    valor: number | null;
  };
  esperado: {
    tipo_regra: string | null;
    aliquota_percentual: number | null;
    valor: number | null;
    vigencia_inicio: string | null;
    vigencia_fim: string | null;
  };
  diferenca: {
    aliquota_pontos_percentuais: number | null;
    valor: number | null;
  };
  fonte: {
    titulo: string | null;
    url: string | null;
    texto_relevante: string | null;
  };
  mensagem: string;
};

export type NFeAnalysisItem = {
  numero_item: number;
  produto_nfe: {
    cProd: string | null;
    xProd: string | null;
    NCM: string | null;
    CFOP: string | null;
    qCom: number | null;
    vProd: number | null;
  };
  match: {
    nivel: string;
    score: number;
    produto_fiscal: {
      produto_id: number;
      ncm: string | null;
      descricao: string | null;
      categoria: string | null;
    } | null;
  };
  analises: TaxAnalysis[];
};

export type NFeAnalysisData = {
  cabecalho: {
    numero: string | null;
    chave_acesso: string | null;
    data_emissao: string | null;
    natureza_operacao: string | null;
    tipo: string | null;
    uf_emitente: string | null;
    uf_destinatario: string | null;
    valor_total: number | null;
  };
  resumo: {
    total_itens: number;
    total_alertas: number;
    total_divergencias: number;
    total_ok: number;
    total_revisao_manual: number;
  };
  itens: NFeAnalysisItem[];
  avisos?: string[];
};

export type FriendlyTaxReport = {
  tributo: string;
  status: AnalysisStatus;
  explicacao: string;
  declarado: string | null;
  correto: string | null;
  diferenca: string | null;
  fonte: string | null;
};

export type FriendlyItemReport = {
  numero_item: number;
  titulo: string;
  resumo: string;
  tributos: FriendlyTaxReport[];
};

export type FriendlyReport = {
  titulo: string;
  resumo_executivo: string;
  pontos_atencao: Array<{
    item: number | null;
    tributo: string | null;
    status: string;
    mensagem: string;
    declarado: string | null;
    correto: string | null;
    diferenca: string | null;
    fonte: string | null;
  }>;
  itens: FriendlyItemReport[];
  fontes: Array<{ titulo: string; url: string | null }>;
  observacao: string;
};

export type NFeFriendlyResponse = {
  dados: NFeAnalysisData;
  relatorio: FriendlyReport;
};

async function parseError(response: Response) {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body) as { detail?: string };
    return parsed.detail || body;
  } catch {
    return body;
  }
}

export async function analyzeNFe(file: File): Promise<NFeFriendlyResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/analisar-nfe`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error((await parseError(response)) || "Nao foi possivel analisar a NF-e.");
  }

  return response.json();
}
