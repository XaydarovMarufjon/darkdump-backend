import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { PythonService } from './python.service';

const execPromise = promisify(exec);
@Controller('search')
export class PythonController {
  constructor(private readonly pythonService: PythonService) { }

  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(__dirname, '../../links', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Error downloading the file', err);
        res.status(500).send('Failed to download the file');
      }
    });
  }



  @Get()
  async getOnionLinks(@Query('query') query: string) {
    if (!query) {
      return { error: 'Query parameter is required' };
    }

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
    const filename = `output_${query}_${timestamp}.txt`;
    const outputDir = path.join(__dirname, '../../outputs');
    const linksDir = path.join(__dirname, '../../links');
    const filepath = path.join(outputDir, filename);

    try {
      console.log('Running OnionSearch for:', filepath);

      // 1. `onionsearch` buyrug'ini bajaramiz va natijani faylga saqlaymiz
      await execPromise(`onionsearch "${query}" > "${filepath}"`);
      console.log('File created:', filepath);

      // 2. Fayl mavjudligini tekshiramiz
      if (!fs.existsSync(filepath)) {
        console.error('Fayl yaratilmadi:', filepath);
        return { error: 'Failed to generate output file' };
      }

      // 3. Faylni links papkasiga ko‘chirish
      await execPromise(`python3 move_txt.py`);

      // 4. Eng oxirgi yaratilgan faylni olish
      const getLatestFile = async (dir: string): Promise<string | null> => {
        const files = await fs.promises.readdir(dir);
        const sortedFiles = await Promise.all(
          files.map(async file => {
            const filePath = path.join(dir, file);
            const stats = await fs.promises.stat(filePath);
            return { name: file, time: stats.mtime.getTime() };
          })
        );

        sortedFiles.sort((a, b) => b.time - a.time);
        return sortedFiles.length > 0 ? sortedFiles[0].name : null;
      };

      const lastFileName = await getLatestFile(linksDir);

      if (lastFileName) {
        const newFilePath = path.join(linksDir, lastFileName);
        const data = await fs.promises.readFile(newFilePath, 'utf-8');

        console.log(`Oxirgi yaratilgan fayl: ${newFilePath}`);

        // 5. Ma'lumotni parsing qilish
        const parseLinks = (data: string): { num: number; resurs: string; title: string; url: string }[] => {
          const lines = data.split('\n').map(line => line.trim()).filter(line => line);
          const result: { num: number; resurs: string; title: string; url: string }[] = [];
          let i = 0;

          for (const line of lines) {
            // CSV formatida vergul bilan ajratilgan qatorni bo‘lib olish
            const parts = line.split('","').map(part => part.replace(/^"|"$/g, ''));

            if (parts.length === 3) {
              result.push({
                num: ++i,
                resurs: parts[0],
                title: parts[1],
                url: parts[2]
              });
            }
          }

          return result;
        };
        const parsedLinks = parseLinks(data);

        // 6. Keraksiz faylni o‘chirish
        setTimeout(async () => {
          try {
            await fs.promises.unlink(filepath);
            console.log(`Deleted file: ${filepath}`);
          } catch (err) {
            console.error(`Failed to delete ${filepath}:`, err);
          }
        }, 3000);
        return parsedLinks;
      } else {
        console.log('Hech qanday yangi fayl topilmadi.');
        return [];
      }
    } catch (error) {
      console.error('Error running OnionSearch:', error);
      return { error: 'Failed to fetch links |-|' };
    }
  }

}
