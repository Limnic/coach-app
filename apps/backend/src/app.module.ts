import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { CheckInsModule } from './modules/check-ins/check-ins.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { ChatModule } from './modules/chat/chat.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { CalculatorModule } from './modules/calculator/calculator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkoutsModule,
    NutritionModule,
    CheckInsModule,
    AlertsModule,
    ChatModule,
    TemplatesModule,
    CalculatorModule,
  ],
})
export class AppModule {}

