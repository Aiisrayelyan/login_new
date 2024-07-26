import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import Database from 'better-sqlite3';
import { Lucia, TimeSpan } from 'lucia';
import { cookies } from 'next/headers';
import { getUserById } from './api';

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

export const createAuthSession = async (id: string) => {
    const session = await lucia.createSession(id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
};

export const verifyAuth = async () => {
    const sessionCookie = cookies().get(lucia.sessionCookieName);
    if (!sessionCookie) {
        return {
            user: null,
            session: null
        };
    }
    const result = await lucia.validateSession(sessionCookie.value);
    if (!result.session) {
        return {
            user: null,
            session: null
        };
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
        return {
            user,
            session: result.session
        };
    }

    return {
        user: null,
        session: null
    };
};

export const destroySession = async () => {
    const result = await verifyAuth();
    if(result.session){
        await lucia.invalidateSession(result.session.id);

        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );
    }
};
