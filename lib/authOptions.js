import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseServer } from "./supabaseServer";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Rider Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { username, password } = credentials;
        const internalEmail = `rider_${username}@coffeeshop.internal`.toLowerCase();

        const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
          email: internalEmail,
          password: password,
        });

        if (authError || !authData.user) {
          throw new Error("Invalid username or password");
        }

        const { data: profile, error: profileError } = await supabaseServer
          .from("profiles")
          .select("default_profile:role, id, email, name, riders!inner(is_active)")
          .eq("id", authData.user.id)
          .single();

        if (profileError || !profile) {
          throw new Error("Rider profile not found");
        }

        if (!profile.riders.is_active) {
          throw new Error("Your account has been deactivated.");
        }

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: "rider",
          is_active: profile.riders.is_active,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
        const isWhitelistedAdmin = adminEmails.includes(user.email);
        
        let assignedRole = isWhitelistedAdmin ? "admin" : "customer";

        // Check if profile exists
        const { data: existingProfile } = await supabaseServer
          .from("profiles")
          .select("id, role")
          .eq("email", user.email)
          .single();

        let profileId = user.id;

        if (existingProfile) {
          profileId = existingProfile.id;
          if (assignedRole === "admin" && existingProfile.role !== "admin") {
            await supabaseServer.from("profiles").update({ role: "admin" }).eq("id", profileId);
          } else if (assignedRole === "customer" && existingProfile.role === "admin" && !isWhitelistedAdmin) {
            // Admin removed
             await supabaseServer.from("profiles").update({ role: "customer" }).eq("id", profileId);
          }
          user.role = isWhitelistedAdmin ? "admin" : existingProfile.role;
        } else {
            // New user via Google! In Supabase, if we bypass auth.users constraint we'll hit FK error.
            // The prompt specified "Auth: Supabase Auth for Google OAuth (Admin and registered Users) + NextAuth.js as the session handler".
            // Since we're using NextAuth's GoogleProvider, we can't directly map NextAuth user.id to Supabase auth.users.id without a custom adapter or admin API inserts.
            
            // To prevent FK errors safely without the adapter, we can insert into auth.users via admin API
            const { data: newUser, error: createError } = await supabaseServer.auth.admin.createUser({
                email: user.email,
                email_confirm: true,
                user_metadata: { name: user.name, avatar_url: user.image },
            });

            if (!createError && newUser) {
                profileId = newUser.user.id;
                // Upsert to profiles using the real auth.users uuid
                await supabaseServer.from("profiles").upsert({
                    id: profileId,
                    email: user.email,
                    name: user.name,
                    photo_url: user.image,
                    role: assignedRole,
                });
            } else if (createError && createError.message.includes('already exists')) {
                // If it exists in auth.users but not profiles... 
                const { data: existingAuth } = await supabaseServer.auth.admin.listUsers();
                const matched = existingAuth.users.find(u => u.email === user.email);
                if (matched) {
                    profileId = matched.id;
                    await supabaseServer.from("profiles").upsert({
                        id: profileId,
                        email: user.email,
                        name: user.name,
                        photo_url: user.image,
                        role: assignedRole,
                    });
                }
            }

            user.role = assignedRole;
        }

        user.profileId = profileId || user.id;

        return true;
      }
      return true; // For credentials provider
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.profileId || user.id;
        token.is_active = user.is_active !== undefined ? user.is_active : true;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.is_active = token.is_active;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login", // We handle admin errors separately mapped via params
  },
  secret: process.env.NEXTAUTH_SECRET,
};
