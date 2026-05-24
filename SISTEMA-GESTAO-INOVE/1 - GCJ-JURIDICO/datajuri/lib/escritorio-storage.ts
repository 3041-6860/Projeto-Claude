import { syncNuvem } from "./sync";

const KEY = "gcj_escritorio";

export interface DadosEscritorio {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  oab: string;
  email: string;
  telefone: string;
  celular: string;
  whatsapp: string;
  site: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  descricao: string;
}

const DEFAULTS: DadosEscritorio = {
  razaoSocial: "Gonçalves Consultoria Sociedade Individual de Advocacia EIRELI",
  nomeFantasia: "Gonçalves Consultoria Jurídica",
  cnpj: "25.297.463/0001-98",
  oab: "OAB/SC 2902",
  email: "operacional@gcj.adv.br",
  telefone: "",
  celular: "",
  whatsapp: "",
  site: "",
  endereco: "Rua Lã Paz, nº 37",
  bairro: "Ponta Aguda",
  cidade: "Blumenau",
  estado: "SC",
  cep: "89051-080",
  descricao: "Escritório de advocacia especializado em direito civil, trabalhista e seguro de veículos, atuando em Santa Catarina.",
};

export function carregarEscritorio(): DadosEscritorio {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<DadosEscritorio>) } : DEFAULTS;
  } catch { return DEFAULTS; }
}

export function salvarEscritorio(dados: DadosEscritorio): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(dados));
    syncNuvem(KEY, dados);
  } catch { /* ignore */ }
}
