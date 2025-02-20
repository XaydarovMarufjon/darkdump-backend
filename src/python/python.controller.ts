import { Controller, Get, Query } from '@nestjs/common';
import { spawn } from 'child_process';

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
const execPromise = promisify(exec);

@Controller('search')
export class PythonController {
  @Get()
  // async search(@Query('query') query: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const pythonProcess = spawn('python3', ['darkdump.py', '-q', query, '-a', '30']);

  //     let output = '';
  //     pythonProcess.stdout.on('data', (data) => {
  //       output += data.toString();
  //     });

  //     pythonProcess.stderr.on('data', (data) => {
  //       console.error(`Error: ${data}`);
  //     });

  //     pythonProcess.on('close', (code) => {
  //       if (code === 0) {
  //         resolve({ results: output.split('\n').filter((line) => line.length > 0) });
  //       } else {
  //         reject('Python script failed');
  //       }
  //     });
  //   });
  // }




  async getOnionLinks(@Query('query') query: string) {
    if (!query) {
      return { error: 'Query parameter is required' };
    }


    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
    const filename = `output_${query}_${timestamp}.txt`;
    const filepath = path.join(__dirname, '../../outputs', filename);


    try {
      // Run OnionSearch command

      console.log("running", filepath);
      await execPromise(`onionsearch "${query}" > ${filepath}`);
      await execPromise(`python3 move_txt.py`)
      const directory: string = path.join(__dirname, '../../links');
      const getLatestFile = (dir: string): string | null => {
        const files = fs.readdirSync(dir)
          .map(file => {
            const filePath = path.join(dir, file);
            return {
              name: file,
              time: fs.statSync(filePath).mtime.getTime()
            };
          })
          .sort((a, b) => b.time - a.time); // Eng yangi fayl birinchi bo'ladi

        return files.length > 0 ? files[0].name : null;
      };
      const lastFileName: string | null = getLatestFile(directory);

      if (lastFileName) {
        const newfilePtah: string = path.join(directory, lastFileName);
        const data = await fs.readFileSync(newfilePtah, 'utf-8');
        const links = data.match(/https?:\/\/[^\s]+|onion:\/\/[^\s]+/g) || [];
        console.log(`Oxirgi yaratilgan DATA: ${data}`);
        console.log(`Oxirgi yaratilgan LINKS: ${links}`);
        console.log(`Oxirgi yaratilgan fayl: ${newfilePtah}`);

        setTimeout(() => {
          fs.unlink(filepath, (err) => {
            if (err) {
              console.error(`Failed to delete ${filepath}:`, err);
            } else {
              console.log(`Deleted file: ${filepath}`);
            }
          });
        }, 3000);
        
        return links.map(url => ({ title: url, url }));
      } else {
        console.log('Hech qanday fayl topilmadi.');
      }

  



    } catch (error) {
      console.error('Error running OnionSearch:', error);
      return { error: 'Failed to fetch linksss' };
    }
  }

}


