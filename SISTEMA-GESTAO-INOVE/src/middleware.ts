import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── Tipos de perfil ─────────────────────────────────────────────────────────
type UserRole = 'admin' | 'gestor' | 'rh' | 'juridico' | 'comercial' | 'financeiro'

// ─── Mapa de permissões: rota → perfis com acesso ─────────────────────────────
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard':               ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro'],
  '/feed':                    ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro'],
  '/perfil':                  ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro'],
  '/calendario':              ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro'],
  '/tarefas':                 ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro'],
  '/mensagens':               ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro'],
  '/documentos':              ['admin', 'gestor', 'rh', 'juridico', 'comercial', 'financeiro'],
  '/negocios':                ['admin', 'gestor', 'juridico', 'comercial'],
  '/crm':                     ['admin', 'gestor', 'comercial'],
  '/financeiro':              ['admin', 'gestor', 'financeiro'],
  '/rh':                      ['admin', 'gestor', 'rh'],
  '/marketing':               ['admin', 'gestor', 'comercial'],
  '/processos':               ['admin', 'gestor', 'juridico'],
  '/datajuri':                ['admin', 'juridico'],
  '/configuracoes':           ['admin'],
}

// ─── Normaliza role (corrige bug do admin@gcj.adv.br) ─────────────────────────
function normalizeRole(role: string): UserRole {
  if (role === 'admin@gcj.adv.br' || role === 'admin') return 'admin'
  const valid: UserRole[] = ['gestor', 'rh', 'juridico', 'comercial', 'financeiro']
  if (valid.includes(role as UserRole)) return role as UserRole
  return 'admin' // fallback seguro
}

// ─── Verifica acesso ──────────────────────────────────────────────────────────
function canAccess(role: string, pathname: string): boolean {
  const normalized = normalizeRole(role)

  // Encontra a rota mais específica que casa com o pathname
  const matches = Object.keys(ROUTE_PERMISSIONS)
    .filter(r => pathname === r || pathname.startsWith(r + '/'))
    .sort((a, b) => b.length - a.length) // mais longa primeiro

  if (matches.length === 0) return true // rota desconhecida: permite

  return ROUTE_PERMISSIONS[matches[0]].includes(normalized)
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const session = request.cookies.get('inove-session')
  const { pathname } = request.nextUrl

  const isLoginPage = pathname === '/login'
  // Exclui assets estáticos, imagens públicas e favicon
  const isPublic    = pathname.startsWith('/_next') ||
                      pathname.startsWith('/favicon') ||
                      /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf)$/.test(pathname)

  if (isPublic) return NextResponse.next()

  // Não autenticado → login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Já autenticado tentando acessar login → dashboard
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Controle de acesso por perfil
  if (session) {
    try {
      // atob é compatível com Edge Runtime (não usa Buffer)
      const decoded = atob(session.value)
      const user    = JSON.parse(decoded) as { role?: string }
      const role    = user.role || 'admin'

      if (!canAccess(role, pathname)) {
        // Redireciona para dashboard com flag de acesso negado
        const url = new URL('/dashboard', request.url)
        url.searchParams.set('acesso-negado', '1')
        return NextResponse.redirect(url)
      }
    } catch {
      // Sessão corrompida → força novo login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
