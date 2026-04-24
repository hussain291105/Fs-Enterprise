import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bills' })
  @ApiResponse({ status: 200, description: 'Returns all bills' })
  async getAllBills() {
    return this.billingService.getAllBills();
  }

  @Get('phone/:name')
  @ApiOperation({ summary: 'Get phone number for customer' })
  @ApiResponse({ status: 200, description: 'Returns phone number for customer' })
  async getCustomerPhone(@Param('name') name: string) {
    return this.billingService.getCustomerPhone(name);
  }

  @Get('view/:id')
  @ApiOperation({ summary: 'View a bill with items' })
  @ApiResponse({ status: 200, description: 'Returns bill details with items' })
  async viewBill(@Param('id') id: string) {
    return this.billingService.viewBill(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single bill' })
  @ApiResponse({ status: 200, description: 'Returns single bill' })
  async getBill(@Param('id') id: string) {
    return this.billingService.getBill(id);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get bill items' })
  @ApiResponse({ status: 200, description: 'Returns bill items' })
  async getBillItems(@Param('id') id: string) {
    return this.billingService.getBillItems(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  async createBill(@Body() createBillDto: CreateBillDto) {
    return this.billingService.createBill(createBillDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bill header' })
  @ApiResponse({ status: 200, description: 'Bill updated successfully' })
  async updateBill(@Param('id') id: string, @Body() updateData: any) {
    return this.billingService.updateBill(id, updateData);
  }

  @Put(':id/items')
  @ApiOperation({ summary: 'Update bill items' })
  @ApiResponse({ status: 200, description: 'Bill items updated successfully' })
  async updateBillItems(@Param('id') id: string, @Body() items: any[]) {
    return this.billingService.updateBillItems(id, items);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bill' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  async deleteBill(@Param('id') id: string) {
    return this.billingService.deleteBill(id);
  }
}
