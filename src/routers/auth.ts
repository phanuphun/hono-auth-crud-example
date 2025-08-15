import { Hono } from "hono";
import knex from "../db/knexClient.js";
import AuthManager from "../utils/AuthManager.js";
import { JwtTokenExpired, type JWTPayload } from "hono/utils/jwt/types";

const auth = new Hono();

auth.post('/login', async (c) => {
    try {
        const { username, password, rememberMe } = await c.req.json();
        const user = await knex('users').where({ username }).first();

        if (!user) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }

        const authManager = new AuthManager();
        const isPasswordValid = await authManager.checkPassword(password, user.passwordHash);

        if (!isPasswordValid) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }

        let tokenExpiration: number;
        if (rememberMe) {
            console.log('Remember me is enabled, setting token expiration to 30 days');
            tokenExpiration = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30); // 30 days expiration
        } else {
            console.log('Remember me is not enabled, setting token expiration to 1 hour');
            // tokenExpiration = Math.floor(Date.now() / 1000) + (60 * 60); // 1 hour expiration
            tokenExpiration = Math.floor(Date.now() / 1000) + 10; // 10 seconds expiration for testing
        }

        const payload = <JWTPayload>{
            userId: user.id,
            username: user.username,
            role: user.role,
            exp: tokenExpiration
        }

        const token = await authManager.createToken(payload);
        return c.json({
            token,
            user: { username: user.username },
            ok: 1,
            message: 'Login successful',
            expiration: rememberMe ? '30 days' : '1 hour'
        }, 200);
    } catch (error) {
        return c.json({
            ok: -1,
            message: 'Internal Server Error',
            error: <string>error
        }, 500);
    }
});

export default auth;