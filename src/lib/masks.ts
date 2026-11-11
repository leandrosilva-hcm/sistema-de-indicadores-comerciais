/**
 * Utilitários de Máscaras e Formatação para Formulários HCM Engenharia
 */

// Limite máximo para valor de obras: R$ 99.999.999.999,99 (~100 bilhões de reais)
export const MAX_PROJECT_VALUE = 99_999_999_999.99;

/**
 * Aplica máscara de moeda brasileira durante a digitação:
 * - Não aceita letras ou caracteres especiais (apenas números, ponto e vírgula)
 * - Insere pontos de milhar automaticamente
 * - Permite digitação com vírgula ou ponto decimal
 * - Limita o valor inteiro a 11 dígitos (~100 bilhões)
 */
export function maskCurrency(raw: string): string {
  if (!raw) return "";

  // Se contém vírgula e pontos (ex: 1.000.000,00 colado)
  if (raw.includes(",") && raw.includes(".")) {
    raw = raw.replace(/\./g, ""); // remove pontos de milhar
  } else if (raw.includes(".") && !raw.includes(",")) {
    // Se digitou ponto decimal no teclado numérico
    const lastDotIndex = raw.lastIndexOf(".");
    if (raw.length - lastDotIndex <= 3 && !raw.slice(0, lastDotIndex).includes(".")) {
      raw = raw.replace(".", ",");
    } else {
      raw = raw.replace(/\./g, "");
    }
  }

  // Permite apenas dígitos e no máximo uma vírgula
  const clean = raw.replace(/[^0-9,]/g, "");
  if (!clean) return "";

  const parts = clean.split(",");
  let intPart = parts[0].slice(0, 11); // máx 11 dígitos inteiros
  const decPart = parts.length > 1 ? parts.slice(1).join("").slice(0, 2) : null;

  if (intPart) {
    intPart = parseInt(intPart, 10).toLocaleString("pt-BR");
  } else if (decPart !== null) {
    intPart = "0";
  }

  return decPart !== null ? `${intPart},${decPart}` : intPart;
}

/**
 * Ao sair do campo (onBlur), garante o formato completo de moeda com centavos (ex: 1.000.000,00)
 */
export function formatCurrencyOnBlur(val: string): string {
  if (!val) return "";
  const masked = maskCurrency(val);
  if (!masked) return "";

  if (!masked.includes(",")) {
    return `${masked},00`;
  }

  const [intP, decP] = masked.split(",");
  return `${intP},${decP.padEnd(2, "0")}`;
}

/**
 * Converte a string formatada em moeda ("1.000.000,00" ou "1.000.000") em float numérico
 */
export function parseCurrencyToNumber(formatted: string): number | null {
  if (!formatted || !formatted.trim()) return null;
  const clean = formatted.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(clean);
  if (isNaN(num)) return null;
  return num > MAX_PROJECT_VALUE ? MAX_PROJECT_VALUE : num;
}

/**
 * Formata um valor numérico para preenchimento de input (ex: 45000000 -> "45.000.000,00")
 */
export function numberToCurrencyInput(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "";
  return val.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Aplica máscara de telefone brasileiro: (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
 * - Bloqueia qualquer caractere que não seja número
 * - Limite de 11 dígitos (DDD + 9 dígitos)
 */
export function maskPhone(rawValue: string): string {
  if (!rawValue) return "";

  // Remove qualquer letra ou caractere especial e limita a 11 dígitos
  const digits = rawValue.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    // Telefone fixo (ex: (61) 3322-1100)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Celular com 9 dígitos (ex: (61) 99999-8888)
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Validação rigorosa de formato de e-mail corporativo
 * Exige obrigatoriamente "@" e formato válido nome@dominio.ext
 */
export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  const trimmed = email.trim();
  if (!trimmed.includes("@")) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Retorna a data atual de Brasília no formato YYYY-MM-DD
 * para restringir inputs de data com `min` (bloqueando datas retroativas)
 */
export function getTodayDateString(): string {
  try {
    return new Intl.DateTimeFormat("fr-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  } catch {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

