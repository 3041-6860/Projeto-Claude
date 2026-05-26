import { cookies } from 'next/headers'
import TopNav from "@/components/TopNav"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const store   = await cookies()
  const session = store.get('inove-session')

  // Padrão: admin com acesso total
  let user = { name: 'Administrador', email: 'admin', role: 'admin' }

  if (session) {
    try {
      user = JSON.parse(Buffer.from(session.value, 'base64').toString())
    } catch {
      // Sessão inválida — mantém fallback acima
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav user={user} />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Passa role para a Sidebar filtrar o menu */}
        <Sidebar role={user.role} />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
