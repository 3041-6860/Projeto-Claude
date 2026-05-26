'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// ─── Usuários do sistema ──────────────────────────────────────────────────────
// PERFIS DISPONÍVEIS:
//   admin      → Acesso total (todas as telas + configurações)
//   gestor     → Gestão completa (sem Configurações)
//   rh         → Módulo RH + tarefas + comunicação
//   juridico   → Processos + documentos + negócios + tarefas
//   comercial  → CRM + negócios + marketing + tarefas
//   financeiro → Financeiro + dashboard + tarefas
//
// ➕ PARA ADICIONAR NOVO COLABORADOR: copie um bloco abaixo e ajuste os campos.
//    Escolha o 'role' de acordo com o departamento do usuário.

const USERS = [
  // ── Administradores ──────────────────────────────────────────────────────────
  { email: 'admin',             password: '1234',          name: 'Administrador',     role: 'admin' },
  { email: 'admin@gcj.adv.br', password: 'Inove2026!',   name: 'Administrador GCJ', role: 'admin' },
  { email: 'sandra',            password: 'Sandra2026!',  name: 'Sandra Otto',        role: 'admin' },
  { email: 'rodrigo',           password: 'Rodrigo2026!', name: 'Rodrigo Gonçalves', role: 'admin' },

  // ── Adicionar novos colaboradores abaixo ──────────────────────────────────────
  // { email: 'nome.sobrenome', password: 'Senha2026!', name: 'Nome Completo', role: 'gestor' },
]

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(_prev: { error: string } | null, formData: FormData) {
  const email    = (formData.get('email')    as string).trim().toLowerCase()
  const password = (formData.get('password') as string)

  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) return { error: 'E-mail ou senha incorretos.' }

  const payload = Buffer.from(
    JSON.stringify({ email: user.email, name: user.name, role: user.role })
  ).toString('base64')

  const store = await cookies()
  store.set('inove-session', payload, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   60 * 60 * 8, // 8 horas
    path:     '/',
  })

  redirect('/dashboard')
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout() {
  const store = await cookies()
  store.delete('inove-session')
  redirect('/login')
}
