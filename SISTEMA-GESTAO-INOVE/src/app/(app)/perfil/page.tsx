import { cookies } from 'next/headers'
import PerfilClient from './client'

export default async function PerfilPage() {
  const store = await cookies()
  const session = store.get('inove-session')
  let user = { name: 'Administrador', email: 'admin', role: 'admin' }
  if (session) {
    try {
      user = JSON.parse(Buffer.from(session.value, 'base64').toString())
    } catch {}
  }
  return <PerfilClient initialUser={user} />
}
