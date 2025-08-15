import crypto from 'crypto';
import 'dotenv/config';
import { decode, sign, verify } from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types';

export default class AuthManager {
    async hashPasswordMd5(password: string): Promise<string> {
        const secret = (process.env.PASSWORD_SECRET) ? process.env.PASSWORD_SECRET : 'Hello_Hono_Secret';
        return crypto.createHash('md5').update(`${secret}_${password}`).digest('hex');
    }

    async createUUID(): Promise<string> {
        return crypto.randomUUID();
    }

    async checkPassword(password: string, passwordHash: string): Promise<boolean> {
        const hash = await this.hashPasswordMd5(password);
        return hash === passwordHash;
    }

    async createToken(payload: JWTPayload): Promise<string> {
        const secret = process.env.JWT_SECRET || 'default_jwt_secret';
        return await sign(payload, secret);
    }

    async verifyToken(token: string): Promise<JWTPayload | unknown> {
        const secret = process.env.JWT_SECRET || 'default_jwt_secret';
        try {
            const resultVerify = await verify(token, secret);
            return resultVerify;
        } catch (error) {
            console.log(`Error verifying token: ${error}`);
            return error;
        }
    }
}