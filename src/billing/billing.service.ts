import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Injectable()
export class BillingService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllBills() {
    try {
      const sql = `
        SELECT 
          MIN(id) AS id,
          CONCAT('INV-', LPAD(MIN(id), 4, '0')) AS bill_number,
          customer_name,
          phone_number,
          bill_date,
          SUM(total) AS subtotal,
          payment_mode,
          status
        FROM billing
        GROUP BY customer_name, phone_number, bill_date, payment_mode, status
        ORDER BY bill_date DESC
      `;
      return await this.databaseService.query(sql);
    } catch (error) {
      console.error('Fetch billing error:', error);
      throw new Error('Failed to fetch bills');
    }
  }

  async getCustomerPhone(name: string) {
    try {
      const sql = `
        SELECT phone_number
        FROM billing
        WHERE customer_name = ?
        AND phone_number IS NOT NULL
        AND phone_number <> ''
        ORDER BY id DESC
        LIMIT 1
      `;
      const rows = await this.databaseService.query(sql, [name]);
      
      if (!rows.length) return { phone_number: '' };
      return { phone_number: rows[0].phone_number };
    } catch (error) {
      console.error('Get phone error:', error);
      throw new Error('Failed to fetch phone number');
    }
  }

  async viewBill(id: string) {
    try {
      const billSql = `
        SELECT 
          MIN(id) as id,
          CONCAT('INV-', LPAD(MIN(id), 4, '0')) AS bill_number,
          customer_name,
          phone_number,
          bill_date,
          payment_mode,
          status,
          SUM(total) AS subtotal
        FROM billing
        WHERE customer_name = (
          SELECT customer_name FROM billing WHERE id = ?
        )
        AND bill_date = (
          SELECT bill_date FROM billing WHERE id = ?
        )
        GROUP BY customer_name, phone_number, bill_date, payment_mode, status
      `;
      
      const itemsSql = `
        SELECT id, gsm_number, description, quantity, price, total
        FROM billing
        WHERE customer_name = (
          SELECT customer_name FROM billing WHERE id = ?
        )
        AND bill_date = (
          SELECT bill_date FROM billing WHERE id = ?
        )
      `;

      const [billRows, items] = await Promise.all([
        this.databaseService.query(billSql, [id, id]),
        this.databaseService.query(itemsSql, [id, id])
      ]);

      if (!billRows.length) {
        throw new Error('Bill not found');
      }

      return {
        bill: billRows[0],
        items,
      };
    } catch (error) {
      console.error('View bill error:', error);
      throw new Error('Failed to fetch bill');
    }
  }

  async getBill(id: string) {
    try {
      const sql = `
        SELECT 
          CONCAT('INV-', LPAD(id, 4, '0')) AS bill_number,
          customer_name,
          phone_number,
          bill_date,
          payment_mode,
          status,
          SUM(total) AS subtotal
        FROM billing
        WHERE id = ?
        GROUP BY customer_name, phone_number, bill_date, payment_mode, status, id
      `;
      
      const rows = await this.databaseService.query(sql, [id]);
      
      if (!rows.length) {
        throw new Error('Bill not found');
      }
      
      return rows[0];
    } catch (error) {
      console.error('Get bill error:', error);
      throw new Error('Failed to load bill');
    }
  }

  async getBillItems(id: string) {
    try {
      const sql = `
        SELECT id, gsm_number, description, quantity, price, total
        FROM billing
        WHERE id = ?
      `;
      
      return await this.databaseService.query(sql, [id]);
    } catch (error) {
      console.error('Get bill items error:', error);
      throw new Error('Failed to load bill items');
    }
  }

  async createBill(createBillDto: CreateBillDto) {
    try {
      // Reset bill number if all bills are deleted
      const [countResult] = await this.databaseService.query(
        'SELECT COUNT(*) AS total FROM billing'
      );

      if (countResult.total === 0) {
        await this.databaseService.query('ALTER TABLE billing AUTO_INCREMENT = 1');
      }

      const { customer_name, phone_number, payment_mode, status, bill_date, items, subtotal } = createBillDto;
      let billId = null;

      for (const item of items) {
        const safeQuantity = Number(item.quantity ?? 0);
        const safeGsm = Number(item.gsm_number);

        const [result] = await this.databaseService.execute(
          `INSERT INTO billing 
            (customer_name, phone_number, payment_mode, status, bill_date, gsm_number, description, quantity, price, total, subtotal)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customer_name,
            phone_number,
            payment_mode,
            status,
            bill_date,
            safeGsm,
            item.description,
            safeQuantity,
            item.price,
            item.total,
            subtotal,
          ]
        );

        if (!billId) billId = result.insertId;

        // Store item in bill_items table
        await this.databaseService.execute(
          'INSERT INTO bill_items (bill_id, gsm_number, description, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [billId, safeGsm, item.description, safeQuantity, item.price]
        );

        // Subtract stock quantity when bill is created
        if (!isNaN(safeGsm) && safeQuantity > 0) {
          await this.databaseService.execute(
            'UPDATE stock_items SET stock = stock - ? WHERE gsm_number = ? AND description = ?',
            [safeQuantity, safeGsm, item.description]
          );
        }
      }

      return {
        success: true,
        id: billId,
        bill_number: `INV-${String(billId).padStart(4, '0')}`,
      };
    } catch (error) {
      console.error('Save bill error:', error);
      throw new Error(error.message || 'Failed to save bill');
    }
  }

  async updateBill(id: string, updateData: any) {
    try {
      const { customer_name, phone_number, payment_mode, status, bill_date, subtotal } = updateData;

      let cleanPhone = (phone_number || '')
        .replace(/\s+/g, '')   // remove spaces
        .replace(/(\+91)+/, '+91');  // avoid repeated +91

      const sql = `
        UPDATE billing 
        SET customer_name=?, phone_number=?, payment_mode=?, status=?, bill_date=?, subtotal=?
        WHERE CONCAT('INV-', LPAD(id, 4, '0')) = ?
      `;
      
      await this.databaseService.query(sql, [
        customer_name, 
        phone_number, 
        payment_mode, 
        status, 
        bill_date, 
        subtotal, 
        `INV-${String(id).padStart(4, '0')}`
      ]);

      return { success: true };
    } catch (error) {
      console.error('Update bill error:', error);
      throw new Error('Failed to update bill');
    }
  }

  async updateBillItems(id: string, items: any[]) {
    try {
      for (const item of items) {
        const qty = Number(item.quantity);
        const gsm = Number(item.gsm_number);

        // Get previous quantity of this item in the bill
        const [oldItem] = await this.databaseService.query(
          'SELECT quantity FROM billing WHERE id = ? AND gsm_number = ? AND description = ?',
          [id, gsm, item.description]
        );

        const oldQty = oldItem.length ? Number(oldItem[0].quantity) : 0;

        // Restore old stock
        await this.databaseService.execute(
          'UPDATE stock_items SET stock = stock + ? WHERE gsm_number = ? AND description = ?',
          [oldQty, gsm, item.description]
        );

        // Deduct new stock
        await this.databaseService.execute(
          'UPDATE stock_items SET stock = stock - ? WHERE gsm_number = ? AND description = ?',
          [qty, gsm, item.description]
        );

        // Update bill row
        await this.databaseService.execute(
          `UPDATE billing 
          SET quantity = ?, price = ?, total = ?, subtotal = ?
          WHERE id = ? AND gsm_number = ? AND description = ?`,
          [qty, item.price, item.total, item.total, id, gsm, item.description]
        );
      }
      
      return { success: true, message: 'Bill updated successfully' };
    } catch (error) {
      console.error('Edit bill error:', error);
      throw new Error(error.message);
    }
  }

  async deleteBill(id: string) {
    try {
      const result = await this.databaseService.execute('DELETE FROM billing WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        throw new Error('Bill not found');
      }

      return { success: true, message: 'Bill deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete bill');
    }
  }
}
