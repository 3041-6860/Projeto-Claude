import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import JuridicoTopNav from '@/components/JuridicoTopNav'

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

  if (role !== 'admin' && role !== 'juridico') {
    redirect('/dashboard?acesso=negado')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <JuridicoTopNav />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
