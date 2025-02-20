import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PythonModule } from './python/python.module';

@Module({
  imports: [PythonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
