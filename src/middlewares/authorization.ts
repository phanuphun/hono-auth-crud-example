import { createMiddleware } from "hono/factory";
import AuthManager from "../utils/AuthManager.js";
const authorization = createMiddleware(async (c, next) => {
    const authorization = c.req.header("Authorization");

    if (!authorization) {
        return c.json({
            ok: 0,
            error: 'Authorization header is missing'
        }, 401);
    }

    const token = authorization.split(' ')[1];

    const authManager = new AuthManager();
    interface Claim {
        exp: number;
        [key: string]: any;
    }
    const isValid = <Claim>await authManager.verifyToken(token);
    if (JSON.stringify(isValid).includes('JwtTokenExpired')) {
        return c.json({
            ok: 0,
            error: 'Invalid or expired token'
        }, 401);
    } else {
        const exp = isValid.exp;
        const date = new Date(exp * 1000);
        const formattedDate = date.toLocaleString('th-TH');
        console.log('Token expiration date:', formattedDate);
    }

    await next();
})

export default authorization;