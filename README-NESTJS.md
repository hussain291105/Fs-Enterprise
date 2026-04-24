# FS Enterprise - NestJS Backend Conversion

This project has been successfully converted from Express.js to NestJS while maintaining all existing functionality.

## 🚀 Current Status

✅ **NestJS Backend**: Successfully running on http://localhost:3000  
✅ **API Documentation**: Available at http://localhost:3000/api/docs  
✅ **MySQL Database**: Connected and operational  
✅ **All Routes Migrated**: Billing, Stock, Expenses, and Reports modules  

## 📁 Project Structure

```
src/
├── main.ts                 # NestJS application entry point
├── app.module.ts           # Root application module
├── app.controller.ts       # Health check endpoints
├── database/               # Database configuration
│   ├── database.module.ts
│   └── database.service.ts
├── billing/                # Billing module
│   ├── billing.module.ts
│   ├── billing.controller.ts
│   ├── billing.service.ts
│   └── dto/
│       └── create-bill.dto.ts
├── stock/                 # Stock management module
│   ├── stock.module.ts
│   ├── stock.controller.ts
│   ├── stock.service.ts
│   └── dto/
│       └── create-stock.dto.ts
├── expenses/              # Expenses module
│   ├── expenses.module.ts
│   ├── expenses.controller.ts
│   ├── expenses.service.ts
│   └── dto/
│       └── create-expense.dto.ts
└── reports/               # Reports module
    ├── reports.module.ts
    ├── reports.controller.ts
    └── reports.service.ts
```

## 🛠️ Available Scripts

### NestJS Backend Commands
```bash
# Development mode with hot reload
npm run start:dev

# Production build
npm run build:nestjs

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

### Frontend Commands (React/Vite - Unchanged)
```bash
# Start frontend development server
npm run dev

# Build frontend for production
npm run build

# Preview frontend build
npm run preview
```

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api`

### Health Check
- `GET /` - Welcome message
- `GET /health` - Health check status

### Billing Module
- `GET /billing` - Get all bills
- `GET /billing/phone/:name` - Get customer phone number
- `GET /billing/view/:id` - View bill with items
- `GET /billing/:id` - Get single bill
- `GET /billing/:id/items` - Get bill items
- `POST /billing` - Create new bill
- `PUT /billing/:id` - Update bill header
- `PUT /billing/:id/items` - Update bill items
- `DELETE /billing/:id` - Delete bill

### Stock Module
- `GET /stock` - Get all stock items
- `POST /stock` - Create new stock item
- `PUT /stock/:id` - Update stock item
- `DELETE /stock/:id` - Delete stock item

### Expenses Module
- `GET /expenses` - Get all expenses
- `GET /expenses/billing-items` - Get billing items
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Reports Module
- `GET /reports/billing` - Get billing report data
- `GET /reports/expenses` - Get expenses report data
- `GET /reports/stock` - Get stock report data
- `GET /reports/profit-ledger` - Get profit ledger
- `POST /reports/profit-ledger/bulk-insert` - Bulk insert profit ledger

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=fsenterprise
MYSQL_PORT=3306

# Server Configuration
PORT=3000
```

## 📚 Swagger Documentation

Interactive API documentation is available at:
- **URL**: http://localhost:3000/api/docs
- **Features**: Test all endpoints directly from the browser

## 🔄 Migration Notes

### What Was Converted
- ✅ Express server → NestJS application
- ✅ Route handlers → Controllers with decorators
- ✅ Database connection → Injectable service
- ✅ Route handlers → Service methods
- ✅ Request validation → DTOs with class-validator
- ✅ API documentation → Swagger/OpenAPI

### What Remains Unchanged
- ✅ React frontend (Vite-based)
- ✅ Database schema and tables
- ✅ All business logic and queries
- ✅ API endpoints and functionality

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   - Copy `.env.example` to `.env` (or create manually)
   - Update database credentials

3. **Start the backend**:
   ```bash
   npm run start:dev
   ```

4. **Start the frontend** (in another terminal):
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs

## 🛡️ Features Added

- **Type Safety**: Full TypeScript support with decorators
- **Validation**: Request/response validation with class-validator
- **Documentation**: Auto-generated Swagger documentation
- **Dependency Injection**: Proper IoC container
- **Modular Architecture**: Clean separation of concerns
- **Error Handling**: Centralized error management
- **Logging**: Built-in logging capabilities

## 🔄 Development Workflow

The project now supports both frontend and backend development:

```bash
# Terminal 1: Backend development
npm run start:dev

# Terminal 2: Frontend development  
npm run dev
```

This setup provides hot reload for both the NestJS backend and React frontend simultaneously.
