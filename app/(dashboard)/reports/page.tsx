'use client';

import { useEffect, useMemo, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuPortal } from "@radix-ui/react-dropdown-menu";
import * as XLSX from "xlsx";                        // For XLSX export
import jsPDF from "jspdf";                           // For PDF export
import autoTable from "jspdf-autotable";             // Table support for PDF
import ModernRangePicker from "@/components/ModernDatePicker";



// ================= TYPES =================
interface BillRow {
  bill_id: number;
  bill_date: string;
  gsm_number: number;
  description: string;
  quantity: number;
  price: number;
  cost_price: number;
}

interface StockItem {
  id: number;
  gsm_number: number;
  category: string;
  cost_price: string;
}

interface ExpenseRow {
  id: number;
  item: string;
  amount: string;
  created_at: string;
}

interface LedgerRow {
  id: number | string;
  bill_id?: number | string;   
  date: string;
  gsm: number | string;
  description: string;
  qty: number;
  price: number;
  cost: number;
  profitPerPiece: number;
  profit: number;
}

interface MonthlyAgg {
  month: string;
  label: string;
  profit: number;
  expense: number;
  net: number;
}

// ================= UTILS =================
const toYYYYMM = (iso: string) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
};

const formatMonthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString(undefined, {
    month: "short",
    year: "numeric",
  });
};

// ================= COMPONENT =================
const ProfitDashboard: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [parts, setParts] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filterGsm, setFilterGsm] = useState<string>("");
  const [filterDescription, setFilterDescription] = useState("All");
  const [showGraphsModal, setShowGraphsModal] = useState(false);
  const [chartView, setChartView] = useState("both");

  useEffect(() => {
    const saved = localStorage.getItem("chartView");
    if (saved) setChartView(saved);
  }, []);
  const modalRef = useRef(null);
  const filterModalRef = useRef(null);
  const [showTableFilter, setShowTableFilter] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("sort");
  const [visibleLedger, setVisibleLedger] = useState<"both" | "profit" | "expense">("both");
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<"profit" | "expense" | null>(null);
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx" | "pdf" | null>(null);

  // ================= SYNC BILLS TO PROFIT LEDGER =================
  const syncBillsToLedger = async (bills: BillRow[]) => {
  try {
    const existing = await fetch("/api/profit-ledger");
    const existingRows = await existing.json();

    // Build a unique key for each stored ledger row
    const existingKeys = new Set(
      existingRows.map((r: any) =>
        `${r.bill_id}-${r.bill_date}-${r.gsm_number}-${r.price}-${r.quantity}`
      )
    );

    // Build a unique key for each bill row coming from Billing table
    const newEntries = bills.filter((b) => {
      const key = `${b.bill_id}-${b.bill_date}-${b.gsm_number}-${b.price}-${b.quantity}`;
      return !existingKeys.has(key);
    });

    if (newEntries.length === 0) return;

    await fetch("/api/profit-ledger/bulk-insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEntries),
    });

    console.log("Synced bills into Profit Ledger:", newEntries);
  } catch (err) {
    console.error("Ledger sync failed:", err);
  }
};


  // ================= FETCH DATA =================
  useEffect(() => {
    setLoading(true);

    const safeJson = async (url: string) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    };

    Promise.all([
      safeJson("/api/profit-ledger"),
      safeJson("/api/expenses"),
      safeJson("/api/stock"),
    ]).then(([billData, expenseData, stockData]) => {
      console.log("BILL DATA FROM API:", billData);
      setBills(billData);
      syncBillsToLedger(billData);
      setExpenses(expenseData);
      setParts(stockData);
      setLoading(false);
      setFromDate("");
      setToDate("");
    });
  }, []);

  // ================= LEDGER LOGIC =================
  const allLedger = useMemo(() => {
    return bills.map((row: any) => {
      const price = Number(row.price || 0);
      const cost = Number(row.cost_price || 0);
      const qty = Number(row.quantity || 1);

      return {
        id: row.bill_id,
        date: row.bill_date,
        gsm: row.gsm_number || "-",
        description: row.description || "-",
        qty: qty,
        price: price,
        cost: cost,
        profitPerPiece: price - cost,
        profit: (price - cost) * qty,
      };
    });
  }, [bills]);

  // ================= FILTERED LEDGER =================
  const filteredLedger = useMemo(() => {
    const formatDate = (d: any) => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    };

    const fromD = fromDate ? formatDate(fromDate) : null;
    const toD = toDate ? formatDate(toDate) : null;

    // 🟦 FIX — REAL DEDUPE KEY
    const unique = new Map<string, any>();
    for (const row of allLedger) {
      const key =
        `${formatDate(row.date)}-${row.gsm}-${row.description}-${row.qty}-${row.price}`;
      if (!unique.has(key)) unique.set(key, row);
    }
    const dedupedLedger = Array.from(unique.values());

    // 🟦 Filters
    return dedupedLedger.filter((row) => {
      const rowD = formatDate(row.date);
      if (!rowD) return false;

      // DATE FILTERS
      if (fromD && rowD < fromD) return false;
      if (toD && rowD > toD) return false;

      // DESCRIPTION FILTER
      if (filterDescription !== "All") {
        if (row.description !== filterDescription) return false;
      }

      // GSM FILTER
      if (filterGsm !== "") {
        if (String(row.gsm) !== String(filterGsm)) return false;
      }

      return true;
    });
  }, [allLedger, fromDate, toDate, filterDescription, filterGsm]);

  // ================= FILTERED EXPENSE LEDGER =================
  const filteredExpense = useMemo(() => {
    return expenses.filter((row) => {
      const rowDate = new Date(row.created_at);

      const fromOk = fromDate ? rowDate >= new Date(fromDate) : true;
      const toOk = toDate ? rowDate <= new Date(toDate) : true;

      return fromOk && toOk;
    });
  }, [expenses, fromDate, toDate]);

  // ===============================
  // EXPORT HANDLER (Profit | Expense)
  // ===============================

  const handleExport = (type: "profit" | "expense") => {
    setSelectedExportType(type);
    setShowExportModal(false);

    if (exportFormat === "csv") {
      type === "profit" ? exportProfitCSV() : exportExpenseCSV();
    }
    else if (exportFormat === "xlsx") {
      type === "profit" ? exportProfitXLSX() : exportExpenseXLSX();
    }
    else if (exportFormat === "pdf") {
      type === "profit" ? exportProfitPDF() : exportExpensePDF();
    }
  };

  // EXPORT PROFIT LEDGER (CSV, XLSX, PDF) 

  // ===============================
  // EXPORT PROFIT CSV
  // ===============================
  const exportProfitCSV = () => {
    const rows = [
      ["Date", "GSM", "Description", "Qty", "Price", "Cost", "Profit/Piece", "Total Profit"],
      ...filteredLedger.map((row) => [
        row.date,
        row.gsm,
        row.description,
        row.qty,
        row.price,
        row.cost,
        row.profitPerPiece,
        row.profit,
      ]),
    ];

    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profit_ledger.csv";
    a.click();
  };

  // ===============================
  // EXPORT PROFIT XLSX
  // ===============================
  const exportProfitXLSX = () => {
    const data = filteredLedger.map((row: any) => ({
      Date: row.date,
      GSM: row.gsm,
      Description: row.description,
      Qty: row.qty,
      Price: row.price,
      Cost: row.cost,
      ProfitPerPiece: row.profitPerPiece,
      TotalProfit: row.profit,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit Ledger");
    XLSX.writeFile(wb, "profit_ledger.xlsx");
  };

  // ===============================
  // EXPORT PROFIT PDF
  // ===============================
  const exportProfitPDF = () => {
    const doc = new jsPDF();

    const tableData = filteredLedger.map((row) => [
        row.date,
        row.gsm,
        row.description,
        row.qty,
        Number(row.price).toFixed(2),
        Number(row.cost).toFixed(2),
        Number(row.profitPerPiece).toFixed(2),
        Number(row.profit).toFixed(2),
      ]);

    autoTable(doc, {
      head: [["Date", "GSM", "Description", "Qty", "Price", "Cost", "Profit/Piece", "Total Profit"]],
      body: tableData,
      startY: 22,
    });

    window.open(URL.createObjectURL(doc.output("blob")), "_blank");
  };

  // EXPORT EXPENSE LEDGER (CSV, XLSX, PDF)
 
  // ===============================
  // EXPORT EXPENSE CSV
  // ===============================
  const exportExpenseCSV = () => {
    const rows = [
      ["Date", "Description", "Amount"],
      ...filteredExpense.map((row) => [
        row.created_at,
        row.item || "-",
        Number(row.amount).toFixed(2),
      ]),
    ];

    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expense_ledger.csv";
    a.click();
  };

  // ===============================
  // EXPORT EXPENSE XLSX
  // ===============================
  const exportExpenseXLSX = () => {
    const data = filteredExpense.map((row: any) => ({
      Date: row.created_at,
      Description: row.item || "-",
      Amount: Number(row.amount).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expense Ledger");
    XLSX.writeFile(wb, "expense_ledger.xlsx");
  };

  // ===============================
  // EXPORT EXPENSE PDF
  // ===============================
  const exportExpensePDF = () => {
    const doc = new jsPDF();

    const tableData = filteredExpense.map((row) => [
        row.created_at,
        row.item || "-",
        Number(row.amount).toFixed(2),
      ]);

    autoTable(doc, {
      head: [["Date", "Description", "Amount"]],
      body: tableData,
      startY: 22,
    });

    window.open(URL.createObjectURL(doc.output("blob")), "_blank");
  };

  // ================= MONTHLY AGG =================
  const monthlyData: MonthlyAgg[] = useMemo(() => {
    const map = new Map<string, { profit: number; expense: number }>();

    filteredLedger.forEach((row) => {
      const m = toYYYYMM(row.date);
      if (!map.has(m)) map.set(m, { profit: 0, expense: 0 });
      map.get(m)!.profit += row.profit;
    });

    expenses.forEach((ex: any) => {
      const m = toYYYYMM(ex.created_at);
      if (!map.has(m)) map.set(m, { profit: 0, expense: 0 });
      map.get(m)!.expense += Number(ex.amount || 0);
    });

    return Array.from(map.entries()).map(([month, val]) => ({
      month,
      label: formatMonthLabel(month),
      profit: val.profit,
      expense: val.expense,
      net: val.profit - val.expense,
    }));
  }, [filteredLedger, expenses]);

  const totalProfit = monthlyData.reduce((s, m) => s + m.profit , 0);
  const totalExpense = filteredExpense.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const netTotal = totalProfit - totalExpense;
  const totalSales = filteredLedger.reduce((s, r) => s + r.price * r.qty, 0);

  // ================= PIE CHART DATA =================
  const pieData = [
    { name: "Profit", value: totalProfit },
    { name: "Expense", value: totalExpense },
    { name: "Net Profit", value: netTotal < 0 ? 0 : netTotal },
  ];

  const COLORS = ["#16a34a", "#dc2626", "#898E8C"];

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">📈 Profit Dashboard</h1>
        <Button 
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
            onClick={() => {
              setShowGraphsModal(true);
              if (!localStorage.getItem("chartView")) {
                setChartView("both");   // always show charts when opening
              }
            }}
          >
            Show Graphs
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader><CardTitle>Total Profit</CardTitle></CardHeader><CardContent><p className="text-green-600 text-xl font-bold">₹{totalProfit.toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Expense</CardTitle></CardHeader><CardContent><p className="text-red-600 text-xl font-bold">₹{totalExpense.toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Net Profit</CardTitle></CardHeader><CardContent><p className="text-gray-500 text-xl font-bold">₹{netTotal.toFixed(2)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Sales</CardTitle></CardHeader><CardContent><p className="text-blue-600 text-xl font-bold">₹{totalSales.toFixed(2)}</p></CardContent></Card>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setShowTableFilter(true)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          >
            Filters
          </Button>
        </div>
        <div className="flex gap-2">
          {/* SHOW GRAPHS BUTTON */}
          <Button
            onClick={() => {
              setExportFormat("csv");
              setShowExportModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setExportFormat("xlsx");
              setShowExportModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Export XLSX
          </Button>
          <Button
          onClick={() => {
            setExportFormat("pdf");
            setShowExportModal(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Export PDF
        </Button>
        </div>
      </div>

      {showGraphsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] overflow-visible">
          <div
            ref={modalRef}
             className={`bg-white rounded-xl shadow-xl p-6 relative overflow-visible animate-fade-in
              ${chartView === "all" ? "w-[95%] max-w-[1600px]" : "w-[50%] max-w-[650px]"}`}
          >

            {/* CLOSE BUTTON */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl"
              onClick={() => setShowGraphsModal(false)}
            >
              &times;
            </button>

            <h2 className="text-s font-normal italic mb-4 text-center">Profit & Expense Graphs Overview</h2>

            {/* === CHART SELECTOR (INSERT HERE) === */}
            <div className="mt-4 mb-5">
              <label className="text-sm font-medium block mb-2">Select Chart</label>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-48 justify-between bg-white text-black border rounded-lg shadow-sm"
                  >
                    {chartView === "line"
                      ? "Line Chart"
                      : chartView === "bar"
                      ? "Bar Chart"
                      : chartView === "pie"
                      ? "Pie Chart"
                      : "All Charts"}
                    <span>▾</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuPortal container={modalRef.current}>
                  <DropdownMenuContent
                    align="start"
                    className="w-full bg-white shadow-lg rounded-lg z-[99999]"
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        setChartView("line");
                        localStorage.setItem("chartView", "line");
                      }}
                    >
                      Line Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setChartView("bar")
                        localStorage.setItem("chartView", "bar");
                      }}
                    >
                      Bar Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setChartView("pie")
                        localStorage.setItem("chartView", "pie");
                      }}
                    >
                      Pie Chart
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {setChartView("all")
                      localStorage.setItem("chartView", "all");
                      }}
                    >
                      All Charts
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </div>

            {/* GRAPHS GRID */}
            <div 
              className={`grid gap-8 ${
                chartView === "all"
                  ? "grid-cols-1 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >

              {/* Monthly Profit vs Expense BAR CHART */}
              {(chartView === "all" || chartView === "bar") && (
              <Card>
                <CardHeader><CardTitle className="text-base font-normal italic">Monthly Profit / Expense</CardTitle></CardHeader>
                <CardContent style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="profit" fill="#16a34a" />
                      <Bar dataKey="expense" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

              {/* Profit, Expense, Net Pie / Doughnut Chart */}
              {(chartView === "all" || chartView === "pie") && (
              <Card>
                <CardHeader><CardTitle className="text-base font-normal italic">Net Profit Distribution</CardTitle></CardHeader>
                <CardContent style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Net Profit Trend LINE CHART */}
            {(chartView === "all" || chartView === "line") && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-normal italic">Net Profit Trend</CardTitle>
                </CardHeader>
                <CardContent style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="net" 
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>
      )}

      {/* TABLE FILTER POPUP */}
      {showTableFilter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div
            ref={filterModalRef}
            className="bg-white rounded-xl shadow-xl w-[90%] max-w-3xl p-6 relative animate-fade-in overflow-visible"
          >

            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-xl text-gray-600 hover:text-black"
              onClick={() => setShowTableFilter(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">Filter Ledger</h2>

            <div className="flex">

              {/* LEFT CATEGORY MENU */}
              <div className="w-1/3 pr-4 border-r">
                <div className="space-y-3">
                  <div
                    className={`px-3 py-2 rounded-lg cursor-pointer font-medium
                      ${activeFilterTab === "sort" ? "bg-sky-100 text-sky-600" : "text-gray-700 hover:bg-gray-100"}
                    `}
                    onClick={() => {
                      setActiveFilterTab("sort");
                      setVisibleLedger("both");
                    }}
                  >
                    Sort By
                  </div>
                   <div
                    className={`px-3 py-2 rounded-lg cursor-pointer
                      ${activeFilterTab === "profit" ? "bg-sky-100 text-sky-600 font-medium" : "text-gray-700 hover:bg-gray-100"}
                    `}
                    onClick={() => {
                      setActiveFilterTab("profit")
                      setVisibleLedger("profit");
                    }}
                  >
                    Profit Ledger
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg cursor-pointer
                      ${activeFilterTab === "expense" ? "bg-sky-100 text-sky-600 font-medium" : "text-gray-700 hover:bg-gray-100"}
                    `}
                    onClick={() => {
                      setActiveFilterTab("expense")
                      setVisibleLedger("expense");
                    }}
                  >
                    Expense Ledger
                  </div>
                </div>
              </div>

              {/* RIGHT FILTER OPTIONS */}
              <div className="w-2/3 pl-6 space-y-4">

                {/* Date */}
                <div className="relative z-[99999]">
                <ModernRangePicker
                  label="Date Range"
                  portalContainer={filterModalRef.current}
                  value={{ from: fromDate ? new Date(fromDate) : undefined, to: toDate ? new Date(toDate) : undefined }}
                  onChange={(range) => {
                    setFromDate(range.from ? range.from.toISOString().split("T")[0] : "");
                    setToDate(range.to ? range.to.toISOString().split("T")[0] : "");
                  }}
                />
                </div>

                <div className="flex gap-4">
                {/* Description */}
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <select
                    className="border rounded-xl px-3 py-2 w-full"
                    value={filterDescription}
                    onChange={(e) => setFilterDescription(e.target.value)}
                  >
                    <option value="All">All</option>
                    {Array.from(new Set(allLedger.map((item) => item.description))).map(
                      (d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* GSM */}
                <div>
                  <label className="text-sm font-medium">GSM</label>
                  <select
                    className="border rounded-xl px-3 py-2 w-full"
                    value={filterGsm}
                    onChange={(e) => setFilterGsm(e.target.value)}
                  >
                    <option value="">All</option>
                    {Array.from(new Set(allLedger.map((item) => item.gsm))).map(
                      (g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex justify-between border-t pt-4 mt-4">
              <button
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setFilterDescription("All");
                  setFilterGsm("");

                  // ✅ Reset selected ledger tab
                  setActiveFilterTab("sort");
                  setVisibleLedger("both");
                }}
                className="text-gray-600 hover:underline"
              >
                Clear filters
              </button>

              <button
                onClick={() => setShowTableFilter(false)}
                className="px-5 py-2 bg-black hover:bg-gray-800 text-white rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export pop up */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Select Ledger to Export</h2>

            <div className="flex flex-row items-center gap-4 w-full justify-center">
              <button
                onClick={() => handleExport("profit")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl w-1/2 text-center whitespace-nowrap"
              >
                Profit Ledger
              </button>

              <button
                onClick={() => handleExport("expense")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl w-1/2 text-center whitespace-nowrap"
              >
                Expense Ledger
              </button>
            </div>
            
            <button
              className="mt-5 w-full border p-2 rounded-lg bg-white hover:bg-gray-100"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PROFIT LEDGER */}
      {(visibleLedger === "both" || visibleLedger === "profit") && (
      <Card>
        <CardHeader><CardTitle>Profit Ledger</CardTitle></CardHeader>
        <CardContent>
        {/* Scrollable Ledger Container */}
        <div className="fade-in" style={{ maxHeight: "350px", overflowY: "auto" }}>
        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Date</th>
                <th className="p-3">GSM</th>
                <th className="p-3">Description</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Price</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Profit/Piece</th>
                <th className="p-3">Total Profit</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((row, idx) => (
                <tr 
                  key={row.id ?? row.bill_id ?? `row-${idx}`}
                  className="table-row hover:bg-[#f7faff] transition"
                >
                  <td className="p-3 text-center">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="p-3 text-center">{row.gsm}</td>
                  <td className="p-3 text-center">{row.description}</td>
                  <td className="p-3 text-center">{row.qty}</td>
                  <td className="p-3 text-center">₹{row.price.toFixed(2)}</td>
                  <td className="p-3 text-center">₹{row.cost.toFixed(2)}</td>
                  <td className="p-3 text-center">₹{row.profitPerPiece.toFixed(2)}</td>
                  <td className="p-3 font-bold text-center">₹{row.profit.toFixed(2)}</td>
                </tr>
              ))}
              {filteredLedger.length === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">No data for selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
        </CardContent>
      </Card>
      )}

      {/* EXPENSE LEDGER */}
      {(visibleLedger === "both" || visibleLedger === "expense") && (
      <Card>
        <CardHeader><CardTitle>Expense Ledger</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3">Date</th>
                <th className="p-3">Item</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpense.map(ex => (
                <tr key={ex.id} className="border-t">
                  <td className="p-3 text-center">{new Date(ex.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-center">{(ex as any).item || "-"}</td>
                  <td className="p-3 font-bold text-center">₹{Number(ex.amount).toFixed(2)}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={3} className="p-6 text-center text-gray-500">No expenses found.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default ProfitDashboard;
