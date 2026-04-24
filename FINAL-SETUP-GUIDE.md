# FS Enterprise - Complete Setup Guide

## 🎯 Project Status: FULLY OPERATIONAL

✅ **Frontend**: React + Vite running on http://localhost:8080  
✅ **Backend**: NestJS running on http://localhost:3000  
✅ **API Docs**: Swagger documentation at http://localhost:3000/api/docs  
✅ **Database**: MySQL connected and operational  

## 🚀 Quick Start Commands

### Option 1: Start Both Services (Recommended)
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm run nestjs
```

### Option 2: Individual Commands
```bash
# Frontend only
npm run dev
# → http://localhost:8080

# Backend only
npm run nestjs  
# → http://localhost:3000
# → API Docs: http://localhost:3000/api/docs
```

## 📡 Complete API Documentation

### Base URL: `http://localhost:3000/api`

### Health & Status
- `GET /` - Welcome message
- `GET /health` - Application health status

### Billing Module (`/api/billing`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing` | Get all bills |
| GET | `/billing/phone/:name` | Get customer phone number |
| GET | `/billing/view/:id` | View bill with items |
| GET | `/billing/:id` | Get single bill |
| GET | `/billing/:id/items` | Get bill items |
| POST | `/billing` | Create new bill |
| PUT | `/billing/:id` | Update bill header |
| PUT | `/billing/:id/items` | Update bill items |
| DELETE | `/billing/:id` | Delete bill |

### Stock Module (`/api/stock`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stock` | Get all stock items |
| POST | `/stock` | Create new stock item |
| PUT | `/stock/:id` | Update stock item |
| DELETE | `/stock/:id` | Delete stock item |

### Expenses Module (`/api/expenses`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | Get all expenses |
| GET | `/expenses/billing-items` | Get billing items |
| POST | `/expenses` | Create new expense |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |

### Reports Module (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/billing` | Get billing report data |
| GET | `/reports/expenses` | Get expenses report data |
| GET | `/reports/stock` | Get stock report data |
| GET | `/reports/profit-ledger` | Get profit ledger |
| POST | `/reports/profit-ledger/bulk-insert` | Bulk insert profit ledger |

## 🔧 Configuration

### Environment Variables (.env)
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

## 📁 Project Structure

```
├── src/
│   ├── main.ts                    # NestJS entry point
│   ├── app.module.ts              # Root module
│   ├── app.controller.ts          # Health endpoints
│   ├── database/                  # Database layer
│   │   ├── database.module.ts
│   │   └── database.service.ts
│   ├── billing/                   # Billing module
│   │   ├── billing.module.ts
│   │   ├── billing.controller.ts
│   │   ├── billing.service.ts
│   │   └── dto/
│   ├── stock/                     # Stock module
│   ├── expenses/                  # Expenses module
│   ├── reports/                   # Reports module
│   └── [frontend files...]        # React frontend (unchanged)
├── server-nestjs.cjs              # Custom server script
├── tsconfig.nestjs.json          # NestJS TypeScript config
└── nest-cli.json                  # NestJS CLI config
```

## 🛠️ Development Workflow

### Daily Development
```bash
# 1. Start backend
npm run nestjs

# 2. Start frontend (new terminal)
npm run dev

# 3. Access applications
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
# API Documentation: http://localhost:3000/api/docs
```

### Building for Production
```bash
# Build backend
npm run build:nestjs

# Build frontend
npm run build
```

## 🔍 Testing the API

### Using Swagger UI (Recommended)
1. Navigate to http://localhost:3000/api/docs
2. Explore endpoints interactively
3. Test API calls directly in browser

### Using curl Examples
```bash
# Health check
curl http://localhost:3000/api/health

# Get all bills
curl http://localhost:3000/api/billing

# Get all stock items
curl http://localhost:3000/api/stock
```

## 🎨 Frontend Features

The React frontend remains unchanged and includes:
- ✅ Modern UI with Tailwind CSS
- ✅ Component library with shadcn/ui
- ✅ Form handling with react-hook-form
- ✅ Data fetching with react-query
- ✅ PDF generation with jsPDF
- ✅ Excel export with xlsx
- ✅ Charts with recharts

## 🔒 Security & Validation

- ✅ Input validation with class-validator DTOs
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS enabled for frontend communication
- ✅ Error handling and logging

## 📈 Performance Features

- ✅ Database connection pooling
- ✅ Efficient query optimization
- ✅ Modular architecture for scalability
- ✅ Hot reload for development
- ✅ Production-ready builds

## 🆘 Troubleshooting

### Common Issues & Solutions

**Frontend not starting:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend not starting:**
```bash
# Rebuild NestJS
npm run build:nestjs
npm run nestjs
```

**Database connection issues:**
1. Check MySQL service is running
2. Verify .env file credentials
3. Ensure database `fsenterprise` exists

**Port conflicts:**
- Frontend defaults to 8080
- Backend defaults to 3000
- Change ports in .env file if needed

## 🎉 Success Metrics

- ✅ Zero breaking changes to frontend
- ✅ All original API endpoints preserved
- ✅ Enhanced with NestJS features
- ✅ Improved code organization
- ✅ Added automatic API documentation
- ✅ Better error handling and validation
- ✅ Production-ready architecture

## 📞 Support

The conversion is complete and fully functional. Both services are running and ready for development or production use.

**Next Steps:**
1. Start developing new features
2. Use Swagger docs for API exploration
3. Enjoy the improved NestJS architecture!
