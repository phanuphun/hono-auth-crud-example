import { writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { DIRNAME } from "../index.js";
import { join } from "path";

export default class FileManager {
    saveFile = async (fileName: string, buffer: Buffer, subFolder: string) => {
        if (!existsSync(join(DIRNAME, 'static', subFolder))) {
            mkdirSync(join(DIRNAME, 'static', subFolder), { recursive: true });
        } else {
            writeFileSync(join(DIRNAME, 'static', subFolder, fileName), buffer);
        }
    };

    createFileName = async (originalFileName: string) => {
        const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
        const randomString = Math.random().toString(36).substring(2, 15);
        const name = originalFileName?.split('.')[0] || 'file';
        const ext = originalFileName?.split('.').pop() || 'png';
        return `${timestamp}_${randomString}_${name}.${ext}`;
    }

    deleteFile = async (fileName: string, subFolder: string) => {
        try {
            if (existsSync(join(DIRNAME, 'static', subFolder, fileName))) {
                unlinkSync(join(DIRNAME, 'static', subFolder, fileName));
            }
        } catch (error) {
            console.error(`Error deleting file: ${error}`);
        }
    }
}
