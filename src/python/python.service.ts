import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PythonService {
    private linksDir = path.join(__dirname, '../../links');

      // Eng oxirgi yaratilgan txt faylni olish
      private getLatestTxtFile(): string | null {
        const files = fs.readdirSync(this.linksDir)
            .filter(file => file.endsWith('.txt')) // Faqat .txt fayllarni olish
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(this.linksDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // Eng oxirgi fayl birinchi keladi

        return files.length > 0 ? files[0].name : null;
    }

    // Oxirgi txt fayldan linklarni o‘qish
    getLinks(): string[] {
        const latestFile = this.getLatestTxtFile();
        if (!latestFile) {
            return [];
        }

        const filePath = path.join(this.linksDir, latestFile);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        return fileContent
            .split('\n') // Har bir qatorni alohida olish
            .map(line => line.trim()) // Bo‘sh joylarni olib tashlash
            .filter(line => line.startsWith('http')); // Faqat URL larni olish
    }
}
