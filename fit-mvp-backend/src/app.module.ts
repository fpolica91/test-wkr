import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { GoalsModule } from './goals/goals.module';
import { WeightModule } from './weight/weight.module';

const serveStaticConfig = (): DynamicModule[] => {
  const frontendPath = join(__dirname, '..', '..', 'frontend-dist');

  if (existsSync(frontendPath)) {
    return [
      ServeStaticModule.forRoot({
        rootPath: frontendPath,
        exclude: ['/api/{*path}'],
      }),
    ];
  }

  return [];
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkoutsModule,
    GoalsModule,
    WeightModule,
    ...serveStaticConfig(),
  ],
  controllers: [AppController],
})
export class AppModule {}
