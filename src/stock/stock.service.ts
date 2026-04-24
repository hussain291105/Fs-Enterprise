import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateStockDto } from './dto/create-stock.dto';

@Injectable()
export class StockService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createStock(createStockDto: CreateStockDto) {
    try {
      const {
        gsm_number,
        category,
        description,
        manufacturer,
        stock,
        cost_price,
        selling_price,
        kg,
        amount,
        minimum_stock,
        unit
      } = createStockDto;

      const sql = `
        INSERT INTO stock_items 
        (gsm_number, category, description, manufacturer, stock, cost_price, selling_price, kg, amount, minimum_stock, unit) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await this.databaseService.execute(sql, [
        gsm_number,
        category,
        description,
        manufacturer,
        stock,
        cost_price,
        selling_price,
        kg,
        amount,
        minimum_stock,
        unit
      ]);

      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Create stock error:', error);
      throw new Error(error.message || 'Failed to create stock item');
    }
  }

  async getAllStock() {
    try {
      const sql = 'SELECT * FROM stock_items ORDER BY id DESC';
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Get all stock error:', error);
      throw new Error('Failed to fetch stock items');
    }
  }

  async updateStock(id: string, updateData: any) {
    try {
      const fields = updateData;
      const sql = 'UPDATE stock_items SET ? WHERE id = ?';
      await this.databaseService.execute(sql, [fields, id]);
      return { success: true };
    } catch (error) {
      console.error('Update stock error:', error);
      throw new Error(error.message || 'Failed to update stock item');
    }
  }

  async deleteStock(id: string) {
    try {
      const sql = 'DELETE FROM stock_items WHERE id = ?';
      await this.databaseService.execute(sql, [id]);
      return { success: true };
    } catch (error) {
      console.error('Delete stock error:', error);
      throw new Error(error.message || 'Failed to delete stock item');
    }
  }
}
