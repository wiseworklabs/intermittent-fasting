import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import logtail from "@/lib/logtail"

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
            // Log to Logtail
            if (process.env.LOGTAIL_SOURCE_TOKEN) {
                logtail.info("New User Created", {
                    userId: user.id || "unknown",
                    email: user.email || "unknown",
                    name: user.name || "unknown",
                });
            } else {
                console.warn("LOGTAIL_SOURCE_TOKEN not set, skipping Logtail log.");
            }

            const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
            const CHANNEL_ID = "C0ADHQNT82H"; // User specified channel

            if (!SLACK_BOT_TOKEN) {
                console.warn("SLACK_BOT_TOKEN is not set. Skipping notification.");
                return;
            }

            try {
                await fetch("https://slack.com/api/chat.postMessage", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${SLACK_BOT_TOKEN}`
                    },
                    body: JSON.stringify({
                        channel: CHANNEL_ID,
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
