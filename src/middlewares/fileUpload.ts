import { createMiddleware } from "hono/factory";
import FileManager from "../utils/fileManager.js";

export const fileUpload = createMiddleware(async (c, next) => {
    const body = await c.req.parseBody()
    const avatarFile = body['avatar'] as File

    if (avatarFile) {
        const buffer = Buffer.from(await avatarFile.arrayBuffer());

        const fileManager = new FileManager();
        const fileName = await fileManager.createFileName(avatarFile.name);
        await fileManager.saveFile(fileName, buffer, 'avatars');
        c.set('avatarFileName', fileName);
        await next();
    }
})