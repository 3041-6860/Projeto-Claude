import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      initials: string;
      cargo: string;
    } & DefaultSession["user"];
  }
  interface User {
    initials: string;
    cargo: string;
  }
}

const USUARIOS = [
  {
    id: "rodrigo",
    emails: ["rodrigo@gcj.adv.br"],
    name: "Rodrigo Gonçalves",
    initials: "R",
    cargo: "Sócio Administrador",
    senha: () => process.env.GCJ_PASS_RODRIGO ?? "gcj2024",
  },
  {
    id: "sandra",
    name: "Sandra Cristina Otto",
    emails: ["operacional@gcj.adv.br", "sandra@gcj.adv.br"],
    initials: "S",
    cargo: "Sócia",
    senha: () => process.env.GCJ_PASS_SANDRA ?? "gcj2024",
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: { type: "password" },
      },
      authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;
        const usuario = USUARIOS.find(
          (u) => u.emails.includes(email) && u.senha() === password
        );
        if (!usuario) return null;
        return {
          id: usuario.id,
          name: usuario.name,
          email,
          initials: usuario.initials,
          cargo: usuario.cargo,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.initials = (user as { initials: string }).initials;
        token.cargo = (user as { cargo: string }).cargo;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as { id: string }).id = (token.id as string) ?? "";
      (session.user as { initials: string }).initials = (token.initials as string) ?? "";
      (session.user as { cargo: string }).cargo = (token.cargo as string) ?? "";
      return session;
    },
  },
});
