'use client'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function Login() {
  const [state, action, pending] = useActionState(login, null)

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
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full border rounded-lg px-3 py-2 text-[12px] outline-none focus:ring-2"
              style={{ borderColor: 'var(--border)' }}
            />
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
