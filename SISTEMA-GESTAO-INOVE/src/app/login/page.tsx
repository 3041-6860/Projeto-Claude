'use client'
import { useActionState, useState } from 'react'
import { login } from '@/app/actions/auth'

function EyeIcon({ open }: { open: boolean }) {
  if (open) return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  )
}

export default function Login() {
  const [state, action, pending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--navy)' }}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-color.png" alt="Grupo Inove Prime" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--gray)' }}>Sistema de Gestão</p>
        </div>

        <form action={action} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--navy)' }}>Usuário</label>
            <input
              name="email"
              type="text"
              placeholder="admin"
              required
              className="w-full border rounded-lg px-3 py-2 text-[12px] outline-none focus:ring-2"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--navy)' }}>Senha</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="w-full border rounded-lg px-3 py-2 text-[12px] outline-none focus:ring-2 pr-9"
                style={{ borderColor: 'var(--border)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: 'var(--gray)' }}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-[11px] text-center" style={{ color: '#c62828' }}>{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 rounded-lg text-white text-[12px] font-semibold mt-1 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'var(--navy)' }}
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-[10px] text-center mt-4" style={{ color: 'var(--gray)' }}>
          Transformando Ideias em Resultados
        </p>
      </div>
    </div>
  )
}
