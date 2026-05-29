import { cookies } from 'next/headers'
import TopNav from "@/components/TopNav";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const session = store.get('inove-session')
  let user = { name: 'Administrador', email: 'admin', role: 'admin' }
  if (session) {
    try {
      user = JSON.parse(Buffer.from(session.value, 'base64').toString())
    } catch {}
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopNav user={user} />
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar role={user.role} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
