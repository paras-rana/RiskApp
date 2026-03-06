import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RisksModule } from './risks/risks.module';

@Module({
  // App-level wiring for config, DB client, and feature modules.
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RisksModule,
  ],
})
export class AppModule {}
