import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
  private connection: mysql.Pool;

  constructor(private readonly configService: ConfigService) {
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      this.connection = mysql.createPool({
        host: this.configService.get<string>('MYSQL_HOST') || 'localhost',
        user: this.configService.get<string>('MYSQL_USER') || 'root',
        password: this.configService.get<string>('MYSQL_PASSWORD'),
        database: this.configService.get<string>('MYSQL_DATABASE') || 'fsenterprise',
        port: this.configService.get<number>('MYSQL_PORT') || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test connection
      const testConnection = await this.connection.getConnection();
      console.log('✅ MySQL Connected Successfully');
      testConnection.release();
    } catch (error) {
      console.error('❌ MySQL Connection Failed:', error.message);
      throw error;
    }
  }

  get pool(): mysql.Pool {
    return this.connection;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<any> {
    try {
      const [result] = await this.connection.execute(sql, params);
      return result;
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }
}
