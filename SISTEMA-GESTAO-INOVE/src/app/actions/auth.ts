'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const USERS = [
  { email: 'admin',          password: '1234',       name: 'Administrador',    role: 'admin'           },
  { email: 'admin@gcj.adv.br', password: 'Inove2026!', name: 'Administrador', role: 'admin@gcj.adv.br' },
  { email: 'rh',             password: 'rh1234',     name: 'Equipe RH',        role: 'rh'              },
  { email: 'gestor',         password: 'gestor1234', name: 'Gestor',           role: 'gestor'          },
]

export async function login(_prev: { error: string } | null, formData: FormData) {
  const email    = (formData.get('email')    as string).trim().toLowerCase()
  const password = (formData.get('password') as string)

  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) return { error: 'E-mail ou senha incorretos.' }

  const payload = Buffer.from(JSON.stringify({ email: user.email, name: user.name, role: user.role })).toString('base64')
  const store = await cookies()
  store.set('inove-session', payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  redirect('/dashboard')
}

export async function logout() {
  const store = await cookies()
  store.delete('inove-session')
  redirect('/login')
}
