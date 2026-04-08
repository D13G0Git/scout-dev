import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Auth.js v5 configuration for Scout DEV.
 * Users are defined in the AUTH_USERS environment variable as a JSON array:
 * AUTH_USERS='[{"email":"admin@orisha.com","password":"secret","name":"Admin"}]'
 */

interface AuthUser {
  email: string;
  password: string;
  name: string;
}

function getAuthUsers(): AuthUser[] {
  const raw = process.env.AUTH_USERS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Scout DEV",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const users = getAuthUsers();
        const user = users.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password,
        );
        if (!user) return null;
        return {
          id: user.email,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnLogin = nextUrl.pathname === "/login";
      if (isOnLogin) return true; // always allow login page
      return isLoggedIn; // redirect to login if not authenticated
    },
  },
});
