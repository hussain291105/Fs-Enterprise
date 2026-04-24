import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHello(): string {
    return 'FS Enterprise API is running!';
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return {
      status: 'ok',
      message: 'FS Enterprise API is healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
