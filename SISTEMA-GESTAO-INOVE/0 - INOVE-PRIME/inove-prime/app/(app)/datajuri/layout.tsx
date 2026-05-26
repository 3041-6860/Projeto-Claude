import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DataJuriLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const session = store.get('inove-session')

  let role = ''
  if (session) {
    try {
      const user = JSON.parse(Buffer.from(session.value, 'base64').toString())
      role = user.role ?? ''
    } catch {}
  }

  // Apenas admin e juridico têm acesso
  if (role !== 'admin' && role !== 'juridico') {
    redirect('/dashboard?acesso=negado')
  }

  return <>{children}</>
}
