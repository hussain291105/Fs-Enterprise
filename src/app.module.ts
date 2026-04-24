import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { BillingModule } from './billing/billing.module';
import { StockModule } from './stock/stock.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReportsModule } from './reports/reports.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    BillingModule,
    StockModule,
    ExpensesModule,
    ReportsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
