import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module';
import { join } from 'path';
import { ProductsModule } from './products/products.module';
import { VariantsModule } from './variants/variants.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => {
        // Production
        if (process.env.DATABASE_URL) {
          return {
            type: 'postgres' as const,
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }

        // Local (Docker)
        return {
          type: 'postgres' as const,
          host: process.env.DB_HOST ?? 'localhost',
          port: parseInt(process.env.DB_PORT ?? '5433', 10),
          username: process.env.DB_USERNAME ?? 'postgres',
          password: process.env.DB_PASSWORD ?? 'mo_db123',
          database: process.env.DB_NAME ?? 'mo_marketplace',
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),

    ProductsModule,
    VariantsModule,
    AuthModule,
    OrdersModule,
  ],
})
export class AppModule {}