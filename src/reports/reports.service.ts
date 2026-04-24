import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getBillingReport() {
    try {
      const sql = `
        SELECT 
          b.id AS bill_id,
          b.bill_date,
          bi.gsm_number,
          bi.description,
          bi.quantity,
          bi.price,
          s.cost_price
        FROM billing b
        JOIN bill_items bi ON bi.bill_id = b.id
        LEFT JOIN stock_items s ON s.gsm_number = bi.gsm_number
        ORDER BY b.id DESC
      `;
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Billing report error:', error);
      throw new Error('Failed to fetch billing data');
    }
  }

  async getExpensesReport() {
    try {
      const sql = 'SELECT * FROM expenses ORDER BY id DESC';
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Expenses report error:', error);
      throw new Error('Failed to fetch expenses');
    }
  }

  async getStockReport() {
    try {
      const sql = 'SELECT * FROM stock_items';
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Stock report error:', error);
      throw new Error('Failed to fetch stock items');
    }
  }

  async getProfitLedger() {
    try {
      const sql = `
        SELECT 
          b.bill_date,
          bi.gsm_number,
          bi.description,
          bi.quantity,
          bi.price,
          s.cost_price
        FROM bill_items bi
        JOIN (
          SELECT MIN(id) AS id, bill_date
          FROM billing
          GROUP BY bill_date
        ) b ON b.id = bi.bill_id
        LEFT JOIN stock_items s ON s.gsm_number = bi.gsm_number
        ORDER BY b.bill_date DESC
      `;
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Profit ledger error:', error);
      throw new Error('Failed to fetch profit ledger');
    }
  }

  async bulkInsertProfitLedger(entries: any[]) {
    try {
      if (!Array.isArray(entries) || entries.length === 0) {
        throw new Error('No entries provided');
      }

      const formatted = entries.map(e => {
        const qty = Number(e.quantity || 1);
        const price = Number(e.price || 0);
        const cost = Number(e.cost_price || 0);

        return [
          e.bill_id,
          e.bill_date ? new Date(e.bill_date) : new Date(),
          e.gsm_number || null,
          e.description || '',
          qty,
          price,
          cost,
          price - cost,               // profit per piece
          (price - cost) * qty        // total profit
        ];
      });

      const sql = `
        INSERT IGNORE INTO profit_ledger 
        (bill_id, bill_date, gsm_number, description, quantity, price, cost_price, profit_per_piece, total_profit)
        VALUES ?
      `;
      
      await this.databaseService.query(sql, [formatted]);
      return { ok: true, inserted: formatted.length };
    } catch (error) {
      console.error('Bulk insert error:', error);
      throw new Error(error.message || 'Bulk insert failed');
    }
  }
}
