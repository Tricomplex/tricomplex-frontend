# tricomplex-frontend

Interface web do Tricomplex, feita em React, Vite, TypeScript, Tailwind e componentes shadcn.

O front permite que o usuario envie um XML de NF-e, chama a API do `back/extractor`, renderiza uma analise amigavel e permite baixar a resposta em Markdown.

## Papel na arquitetura

```text
usuario
  -> front React/Vite
  -> POST VITE_API_BASE_URL/analisar-nfe
  -> recebe JSON { dados, relatorio }
  -> renderiza relatorio em cards/listas
  -> gera .md no navegador quando usuario clica em "Baixar resposta"
```

O front nao calcula regra fiscal. Ele apenas:

- valida se o arquivo enviado e `.xml`;
- envia o arquivo para a API;
- exibe o retorno;
- baixa um Markdown derivado do JSON recebido.

## Stack

- React 18
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk para autenticacao
- TanStack Query instalado no projeto

## Arquivos importantes

- `src/pages/Analise.tsx`: tela de upload e exibicao da analise.
- `src/lib/api.ts`: client HTTP para a API do extractor.
- `src/lib/utils.ts`: helper `cn` usado pelos componentes shadcn.
- `src/components/`: navbar, footer, rotas protegidas e componentes visuais.
- `.env.example`: variaveis esperadas pelo Vite.

## Variaveis de ambiente

Crie `.env` a partir de `.env.example`.

```text
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=...
```

`VITE_API_BASE_URL` deve apontar para a API FastAPI do `back/extractor`.

Em deploy, exemplo:

```text
VITE_API_BASE_URL=https://api-tricomplex.up.railway.app
```

## Instalar

```bash
npm install
```

## Rodar localmente

1. Suba a API:

```bash
cd ../back/extractor
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

2. Suba o front:

```bash
cd ../../front
npm run dev
```

Por padrao o Vite roda em:

```text
http://localhost:8080
```

## Fluxo da tela de analise

1. Usuario acessa `/analise`.
2. Usuario arrasta ou seleciona um XML.
3. `src/lib/api.ts` envia `multipart/form-data` para:

```text
POST /analisar-nfe
```

4. A API retorna:

```json
{
  "dados": {
    "cabecalho": {},
    "resumo": {},
    "itens": []
  },
  "relatorio": {
    "titulo": "Analise da NF-e",
    "resumo_executivo": "...",
    "pontos_atencao": [],
    "itens": [],
    "fontes": [],
    "observacao": "..."
  }
}
```

5. O front usa `relatorio` para a apresentacao amigavel.
6. O front pode usar `dados` para debug, metricas e futuras visualizacoes mais tecnicas.

## Download de resposta

O botao "Baixar resposta" gera um arquivo `.md` no navegador. O Markdown e montado no front a partir do JSON estruturado em `relatorio`; ele nao depende de Markdown livre gerado pela IA.

Isso evita problemas de formatacao e deixa a UI sob controle do React.

## Comandos uteis

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Testes:

```bash
npm test
```

Preview de producao:

```bash
npm run preview
```

## Deploy

Sugestao para pitch:

- Vercel ou Netlify para o front.
- Configurar `VITE_API_BASE_URL` com a URL publica da API.
- Garantir que `CORS_ORIGINS` no backend inclui a URL do front.

Exemplo:

```text
Front: https://tricomplex.vercel.app
API:   https://tricomplex-api.up.railway.app
```

Backend:

```text
CORS_ORIGINS=https://tricomplex.vercel.app
```

Frontend:

```text
VITE_API_BASE_URL=https://tricomplex-api.up.railway.app
```

## Observacoes

- `src/lib` e codigo-fonte e deve ser versionado.
- Nao versionar `.env`, `node_modules` ou `dist`.
- Se o Vite reclamar que nao encontra `@/lib/api` ou `@/lib/utils`, provavelmente a pasta `src/lib` nao foi commitada/puxada no clone.
