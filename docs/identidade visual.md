# Identidade Visual e Design System: HCM Engenharia

Documento de especificação visual para customização do tema Tailwind CSS, componentes shadcn/ui e paleta de cores corporativa.

---

## 1. Paleta de Cores e Tokens de Design

A identidade visual é baseada na marca **HCM Engenharia**, utilizando alto contraste, minimalismo industrial/corporativo e acabamento sóbrio.

| Nome do Token | Hexadecimal | RGB / HSL | Aplicação Principal |
| :--- | :--- | :--- | :--- |
| **Brand Primary (Ocre/Laranja HCM)** | `#dc911b` | `hsl(37, 78%, 48%)` | Destaques de ação, botões principais, status ativos, indicadores de urgência, linhas de foco. |
| **Brand Primary Hover** | `#c47d12` | `hsl(37, 82%, 42%)` | Estado hover de botões primários e links destacados. |
| **Dark Background (Preto)** | `#000000` | `hsl(0, 0%, 0%)` | Sidebar institucional, contraste de cabeçalho, fundos escuros do logo branco. |
| **Surface Dark (Preto Suave / Gray 950)** | `#0d0f11` | `hsl(210, 13%, 6%)` | Fundo de cartões em dark mode ou superfícies de elevação na sidebar. |
| **Light Background (Branco Puro)** | `#ffffff` | `hsl(0, 0%, 100%)` | Fundo de páginas operacionais (Kanban, tabelas, modais) e texto sobre fundos escuros. |
| **Neutral Slate Gray (Bordas e Linhas)** | `#e2e8f0` | `hsl(214, 32%, 91%)` | Divisores, contornos de cards, bordas sutis de inputs. |
| **Text Primary (Preto Suave)** | `#0f172a` | `hsl(222, 47%, 11%)` | Títulos, textos corridos de alta legibilidade em fundo claro. |
| **Text Muted (Cinza Intermediário)** | `#64748b` | `hsl(215, 16%, 47%)` | Subtítulos, carimbos de data/hora, metadados de cards. |

---

## 2. Tipografia e Voz Visual

* **Tipografia Principal:** `Inter`, `Geist Sans` ou `system-ui`.
* **Hierarquia:**
  * **Títulos e Logotipo:** Fonte geométrica robusta, sem serifa, peso `font-bold` ou `font-extrabold`.
  * **Métricas e KPIs:** Numerais com peso `font-semibold` ou `font-bold` e tracking compacto (`tracking-tight`).
  * **Rótulos e Badges:** `text-xs font-medium uppercase tracking-wider`.
* **Ícones:** Linhas minimalistas com traço regular (`Lucide Icons`, espessura 1.75px ou 2px).

---

## 3. Diretrizes de Layout e Componentes

1. **Sidebar Institucional:**
   * Fundo preto total (`#000000`).
   * Logotipo em versão branca (`HCM-Engenharia-Branca.png`) centralizado no topo.
   * Links ativos com badge ou indicador lateral na cor ocre `#dc911b`.
2. **Cards do Kanban:**
   * Fundo branco puro (`#ffffff`) com bordas suaves (`border border-slate-200`).
   * Linha ou tag de topo no card em `#dc911b` para sinalizar prioridade ou fase de Carta Convite.
   * Hover suave com elevação discreta (`hover:shadow-md transition-shadow`).
3. **Botões e Ações:**
   * **Primário:** `bg-[#dc911b] hover:bg-[#c47d12] text-black font-semibold`.
   * **Secundário/Neutro:** Fundo transparente com borda preta ou branca dependendo da superfície (`border-2 border-black text-black hover:bg-black hover:text-white`).
4. **Drawers e Modais de Interação:**
   * Cabeçalho de destaque com a marcação temporal da "Última Tratativa" envolvida por uma borda de destaque `#dc911b`.

---

## 4. Prompt Executável para o Antigravity

Copie e cole o prompt abaixo no console ou chat do **Google Antigravity** para que o agente refatore e aplique a identidade visual no projeto:

```text
Atue como Designer de UI / Engenheiro Frontend especialista em Tailwind CSS e shadcn/ui.
Aplique a nova identidade visual oficial da HCM Engenharia no projeto de acordo com as especificações a seguir:

1. Configuração de Cores e Tokens (tailwind.config.ts e globals.css):
   - Cor Primária (Brand Accent): #dc911b (com hover em #c47d12).
   - Fundo Escuro / Sidebar: #000000.
   - Fundo Claro / Superfície: #ffffff.
   - Textos: #0f172a (primário) e #64748b (secundário/muted).
   - Bordas sutis: #e2e8f0.
   - Atualize as variáveis CSS HSL no `globals.css` para que as classes `primary`, `background`, `foreground`, `border` e `ring` reflitam essa paleta exata.

2. Barra Lateral (Sidebar):
   - Mude o fundo da Sidebar para preto (#000000).
   - Insira o logotipo da HCM Engenharia no topo (usando a imagem branca/vetor de contraste).
   - Os itens de navegação selecionados/ativos devem utilizar destaque de texto ou fundo com a cor #dc911b.

3. Componentes e Botões (shadcn/ui):
   - Refatore o componente `Button` variante `default` para utilizar `bg-[#dc911b] text-black hover:bg-[#c47d12] font-semibold`.
   - Ajuste os Badges de status do Kanban para utilizarem variações sólidas ou sutis baseadas em tons de ocre (#dc911b), preto (#000000) e cinza.
   - Nos cards do Kanban e no Drawer de detalhes, dê destaque visual à regra de "Última Tratativa" com uma borda lateral ou acento em #dc911b.

4. Gráficos do Dashboard (Recharts):
   - Ajuste a paleta de cores dos gráficos no Dashboard para harmonizar com a marca: use #dc911b como série principal de dados, acompanhado de tons monocromáticos (preto, cinzas escuros #334155, cinzas médios #64748b).

Execute as alterações nos arquivos de configuração, componentes e páginas. Rode a compilação e confirme se o visual está consistente e funcional.
```