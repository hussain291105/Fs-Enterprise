import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllExpenses() {
    try {
      const sql = 'SELECT id, item, qty, amount, created_at FROM expenses ORDER BY created_at DESC';
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Fetch expenses error:', error);
      throw new Error('Failed to fetch expenses');
    }
  }

  async getBillingItems() {
    try {
      const sql = 'SELECT * FROM bill_items';
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Fetch billing items error:', error);
      throw new Error('Failed to fetch billing items');
    }
  }

  async createExpense(createExpenseDto: CreateExpenseDto) {
    try {
      const { item, qty, amount } = createExpenseDto;

      if (!item || !qty || !amount) {
        throw new Error('item, qty and amount are required');
      }

      const sql = 'INSERT INTO expenses (item, qty, amount, created_at) VALUES (?, ?, ?, NOW())';
      const result = await this.databaseService.execute(sql, [item, qty, amount]);

      return {
        id: result.insertId,
        item,
        qty,
        amount,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Create expense error:', error);
      throw new Error(error.message || 'Failed to save expense');
    }
  }

  async updateExpense(id: string, updateData: any) {
    try {
      const { item, qty, amount } = updateData;
      const sql = 'UPDATE expenses SET item = ?, qty = ?, amount = ? WHERE id = ?';
      await this.databaseService.execute(sql, [item, qty, amount, id]);
      return { id, item, qty, amount };
    } catch (error) {
      console.error('Update expense error:', error);
      throw new Error(error.message || 'Failed to update expense');
    }
  }

  async deleteExpense(id: string) {
    try {
      const sql = 'DELETE FROM expenses WHERE id = ?';
      await this.databaseService.execute(sql, [id]);
      return { message: 'Deleted successfully' };
    } catch (error) {
      console.error('Delete expense error:', error);
      throw new Error(error.message || 'Failed to delete expense');
    }
  }
}
