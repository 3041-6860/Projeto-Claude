"use client";
import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, FileText, Save, X, Edit3, CheckCircle2 } from "lucide-react";
import { carregarEscritorio, salvarEscritorio } from "@/lib/datajuri/escritorio-storage";
import type { DadosEscritorio } from "@/lib/datajuri/escritorio-storage";

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-8 px-3 text-[12px] rounded-lg focus:outline-none transition-colors"
      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; props.onFocus?.(e); }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; props.onBlur?.(e); }}
    />
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "var(--border-light)", background: "var(--bg)" }}>
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--gcj-red)" }} />
        <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  name: keyof DadosEscritorio;
  editing: boolean;
  onChange: (name: keyof DadosEscritorio, value: string) => void;
  span?: boolean;
}

function Field({ label, value, name, editing, onChange, span }: FieldProps) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <Label>{label}</Label>
      {editing
        ? <Inp value={value} onChange={(e) => onChange(name, e.target.value)} />
        : <p className="text-[12px]" style={{ color: value ? "var(--text-primary)" : "var(--text-muted)" }}>
            {value || <em>Não informado</em>}
          </p>
      }
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function EscritorioPage() {
  const [data, setData] = useState<DadosEscritorio>(() => carregarEscritorio());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DadosEscritorio>(data);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = carregarEscritorio();
    setData(loaded);
    setDraft(loaded);
  }, []);

  function startEdit() {
    setDraft({ ...data });
    setEditing(true);
    setSaved(false);
  }

  function cancelEdit() {
    setDraft({ ...data });
    setEditing(false);
  }

  function handleChange(name: keyof DadosEscritorio, value: string) {
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    salvarEscritorio(draft);
    setData({ ...draft });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const d = editing ? draft : data;

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Escritório</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Dados do escritório de advocacia</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" }}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Salvo com sucesso
            </div>
          )}
          {editing ? (
            <>
              <button type="button" onClick={cancelEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
              <button type="button" onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold"
                style={{ background: "var(--gcj-red)", color: "#fff" }}>
                <Save className="h-3.5 w-3.5" />
                Salvar
              </button>
            </>
          ) : (
            <button type="button" onClick={startEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              <Edit3 className="h-3.5 w-3.5" />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Coluna principal */}
        <div className="md:col-span-2 space-y-4">

          <Section title="Dados Jurídicos" icon={Building2}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Razão Social" name="razaoSocial" value={d.razaoSocial} editing={editing} onChange={handleChange} span />
              <Field label="Nome Fantasia" name="nomeFantasia" value={d.nomeFantasia} editing={editing} onChange={handleChange} span />
              <Field label="CNPJ" name="cnpj" value={d.cnpj} editing={editing} onChange={handleChange} />
              <Field label="Registro OAB" name="oab" value={d.oab} editing={editing} onChange={handleChange} />
            </div>
          </Section>

          <Section title="Endereço" icon={MapPin}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Logradouro" name="endereco" value={d.endereco} editing={editing} onChange={handleChange} span />
              <Field label="Bairro" name="bairro" value={d.bairro} editing={editing} onChange={handleChange} />
              <Field label="CEP" name="cep" value={d.cep} editing={editing} onChange={handleChange} />
              <Field label="Cidade" name="cidade" value={d.cidade} editing={editing} onChange={handleChange} />
              <Field label="Estado" name="estado" value={d.estado} editing={editing} onChange={handleChange} />
            </div>
          </Section>

          <Section title="Sobre o Escritório" icon={FileText}>
            {editing ? (
              <textarea
                value={d.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 text-[12px] rounded-lg resize-none focus:outline-none transition-colors"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#111"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
            ) : (
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {d.descricao || <em style={{ color: "var(--text-muted)" }}>Não informado</em>}
              </p>
            )}
          </Section>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">

          <Section title="Contato" icon={Phone}>
            <div className="space-y-4">
              <Field label="E-mail" name="email" value={d.email} editing={editing} onChange={handleChange} />
              <Field label="Telefone" name="telefone" value={d.telefone} editing={editing} onChange={handleChange} />
              <Field label="Celular" name="celular" value={d.celular} editing={editing} onChange={handleChange} />
              <Field label="WhatsApp" name="whatsapp" value={d.whatsapp} editing={editing} onChange={handleChange} />
              <Field label="Site" name="site" value={d.site} editing={editing} onChange={handleChange} />
            </div>
          </Section>

          {/* Resumo OAB */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: "#fff", border: "1px solid var(--border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--gcj-red)" }}>Resumo OAB</p>
            <div className="space-y-2">
              {[
                { label: "Seccional", value: d.oab.split(" ")[0] },
                { label: "Nº Sociedade", value: d.oab.split(" ")[1] ?? "" },
                { label: "CNPJ", value: d.cnpj },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="text-[11px] font-medium" style={{ color: "var(--text-primary)" }}>{value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
