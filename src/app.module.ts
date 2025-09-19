import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenaiModule } from './openai/openai.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LearningPlansModule } from './learning-plans/learning-plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<string>('DB_PORT');
        const dbName = configService.get<string>('DB_NAME');
        const username = configService.get<string>('DB_USER');
        const password = configService.get<string>('DB_PASSWORD');

        const uri = `mongodb://${host}:${port}/${dbName}`;
        return {
          uri,
          auth: {
            username,
            password,
          },
          authSource: 'admin', // Use admin auth database like Compass does
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    OpenaiModule,
    AuthModule,
    LearningPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
