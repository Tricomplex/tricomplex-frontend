const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function analyzeNFeMarkdown(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/analisar-nfe`, {
    method: "POST",
    body: formData,
  });

  const body = await response.text();

  if (!response.ok) {
    let detail = body;
    try {
      const parsed = JSON.parse(body) as { detail?: string };
      detail = parsed.detail || body;
    } catch {
      // FastAPI usually returns JSON errors, but keep plain text support.
    }
    throw new Error(detail || "Nao foi possivel analisar a NF-e.");
  }

  return body;
}
