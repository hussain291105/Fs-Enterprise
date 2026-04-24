import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('billing')
  @ApiOperation({ summary: 'Get all bills for reports' })
  @ApiResponse({ status: 200, description: 'Returns billing data for reports' })
  async getBillingReport() {
    return this.reportsService.getBillingReport();
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get all expenses for reports' })
  @ApiResponse({ status: 200, description: 'Returns expenses data for reports' })
  async getExpensesReport() {
    return this.reportsService.getExpensesReport();
  }

  @Get('stock')
  @ApiOperation({ summary: 'Get all stock items for reports' })
  @ApiResponse({ status: 200, description: 'Returns stock data for reports' })
  async getStockReport() {
    return this.reportsService.getStockReport();
  }

  @Get('profit-ledger')
  @ApiOperation({ summary: 'Get profit ledger' })
  @ApiResponse({ status: 200, description: 'Returns profit ledger data' })
  async getProfitLedger() {
    return this.reportsService.getProfitLedger();
  }

  @Post('profit-ledger/bulk-insert')
  @ApiOperation({ summary: 'Bulk insert profit ledger entries' })
  @ApiResponse({ status: 200, description: 'Profit ledger entries inserted successfully' })
  async bulkInsertProfitLedger(@Body() data: { entries: any[] }) {
    return this.reportsService.bulkInsertProfitLedger(data.entries);
  }
}
