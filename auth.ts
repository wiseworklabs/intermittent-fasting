import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id
                // @ts-expect-error user is typed as AdapterUser which might not have nickname in the default type definition yet
                session.user.nickname = user.nickname
            }
            return session
        },
    },
    events: {
        async createUser({ user }) {
            if (!process.env.SLACK_WEBHOOK_URL) {
                console.warn("SLACK_WEBHOOK_URL is not set. Skipping notification.");
                return;
            }

            try {
                await fetch(process.env.SLACK_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: `🎉 *새로운 사용자가 가입했습니다!* \n\n👤 *이름:* ${user.name || "알 수 없음"}\n📧 *이메일:* ${user.email}\n🆔 *ID:* ${user.id}`
                    }),
                });
                console.log("Slack notification sent for new user:", user.email);
            } catch (error) {
                console.error("Failed to send Slack notification", error);
            }
        },
    },
})
