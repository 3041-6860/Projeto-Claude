import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RHTopNav from '@/components/RHTopNav'

export default async function RHLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const session = store.get('inove-session')

  let role = ''
  if (session) {
    try {
      const user = JSON.parse(Buffer.from(session.value, 'base64').toString())
      role = user.role ?? ''
    } catch {}
  }

  if (role !== 'admin' && role !== 'rh') {
    redirect('/dashboard?acesso=negado')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <RHTopNav />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
