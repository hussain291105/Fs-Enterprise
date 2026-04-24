import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';

@ApiTags('stock')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @ApiOperation({ summary: 'Create new stock item' })
  @ApiResponse({ status: 201, description: 'Stock item created successfully' })
  async createStock(@Body() createStockDto: CreateStockDto) {
    return this.stockService.createStock(createStockDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stock items' })
  @ApiResponse({ status: 200, description: 'Returns all stock items' })
  async getAllStock() {
    return this.stockService.getAllStock();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update stock item' })
  @ApiResponse({ status: 200, description: 'Stock item updated successfully' })
  async updateStock(@Param('id') id: string, @Body() updateData: any) {
    return this.stockService.updateStock(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete stock item' })
  @ApiResponse({ status: 200, description: 'Stock item deleted successfully' })
  async deleteStock(@Param('id') id: string) {
    return this.stockService.deleteStock(id);
  }
}
