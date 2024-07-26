import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import Database from 'better-sqlite3';
import { Lucia, TimeSpan } from 'lucia';
import { cookies } from 'next/headers';
import { getUserById } from '../../lib/api';

const db = new Database("auth.db");
const adapter = new BetterSqlite3Adapter(db, {
    user: "users",
    session: "session"
});

export const lucia = new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(30, 's'),
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production"
        }
    }
});

export async function GET(req:Request){
    const sessionCookie = cookies().get(lucia.sessionCookieName);
    if (!sessionCookie) {
        return Response.json({
            user: null,
            session: null
        });
    }
    const result = await lucia.validateSession(sessionCookie.value);
    if (!result.session) {
        return Response.json({
            user: null,
            session: null
        });
    }
    try {
        if (result.session) {
            const sessionCookie = lucia.createSessionCookie(result.session.id);

            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        } else {
            const sessionCookie = lucia.createBlankSessionCookie();

            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
    } catch { }

    const user = getUserById(result.session.userId);
    if (user) {
        return Response.json({
            user,
            session: result.session
        });
    }

    return Response.json({
        user: null,
        session: null
    });
}