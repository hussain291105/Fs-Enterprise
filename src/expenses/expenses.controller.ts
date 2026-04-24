import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expenses' })
  @ApiResponse({ status: 200, description: 'Returns all expenses' })
  async getAllExpenses() {
    return this.expensesService.getAllExpenses();
  }

  @Get('billing-items')
  @ApiOperation({ summary: 'Get billing items' })
  @ApiResponse({ status: 200, description: 'Returns billing items' })
  async getBillingItems() {
    return this.expensesService.getBillingItems();
  }

  @Post()
  @ApiOperation({ summary: 'Create new expense' })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  async createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.createExpense(createExpenseDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  async updateExpense(@Param('id') id: string, @Body() updateData: any) {
    return this.expensesService.updateExpense(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  async deleteExpense(@Param('id') id: string) {
    return this.expensesService.deleteExpense(id);
  }
}
