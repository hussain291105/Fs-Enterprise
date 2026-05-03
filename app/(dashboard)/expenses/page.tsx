'use client';

import { useState, useEffect, useMemo } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ModernRangePicker from "@/components/ModernDatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export interface Expense {
  id?: string;
  item: string;
  qty: number;
  amount: number;
  created_at?: string;
}

const API_URL = "/api/expenses";

const PAGE_SIZE = 20;

export default function ExpenseReport() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [rowEditData, setRowEditData] = useState<Expense>({
    item: "",
    qty: 1,
    amount: 0,
  });

  const [expense, setExpense] = useState<Expense>({
    item: "",
    qty: 1,
    amount: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense;
    direction: "asc" | "desc";
  } | null>(null);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    item: "",
    qty: "",
    amount: "",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  // ================= LOAD DATA =================
  const loadExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    const sorted = data.sort((a: Expense, b: Expense) => {
      // Sort by created_at since id is now a string
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // newest first
    });
    setExpenses(sorted);
  };

  // ================= ADD EXPENSE =================
  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpense((prev) => ({
      ...prev,
      [name]: name === "qty" || name === "amount" ? Number(value) : value,
    }));
  };

  const addExpense = async () => {
    if (!expense.item || !expense.amount) return;

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(expense),
    });
    const data = await res.json();
    setExpenses((prev) => [data, ...prev]);
    setExpense({ item: "", qty: 1, amount: 0 });
    toast.success("Expense added");
  };

  const handleSaveExpense = async () => {
    if (!newExpense.item || !newExpense.qty || !newExpense.amount) {
      toast.error("All fields are required");
      return;
    }

    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      });

      toast.success("Expense added successfully");

      // Reset modal + fields
      setShowModal(false);
      setNewExpense({ item: "", qty: "", amount: "" });

      // Reload list
      loadExpenses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    }
  };

  // ================= INLINE EDIT =================
  const startEditRow = (exp: Expense) => {
    setEditingRowId(exp.id!);
    setRowEditData({ ...exp });
  };

  const handleRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRowEditData((prev) => ({
      ...prev,
      [name]: name === "qty" || name === "amount" ? Number(value) : value,
    }));
  };

  const saveRowUpdate = async (id: string) => {
    console.log('Saving expense update:', { id, rowEditData });

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rowEditData),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('Failed to update expense:', error);
      toast.error(error.error || "Failed to update expense");
      return;
    }

    await loadExpenses();
    setEditingRowId(null);
    toast.success("Updated");
  };

  const cancelRowEdit = () => setEditingRowId(null);

  const deleteRow = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Delete this expense?")) return;

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast.success("Deleted");
  };

  // =============================================
  // FILTER + SEARCH + SORT + INFINITE SCROLL
  // =============================================

  const normalizeDate = (value: string) => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...expenses];

    // 🔍 SEARCH
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (exp) =>
          exp.item.toLowerCase().includes(term) ||
          String(exp.qty).includes(term) ||
          String(exp.amount).includes(term) ||
          (exp.created_at &&
            new Date(exp.created_at).toLocaleDateString().includes(term))
      );
    }

    // 📅 DATE RANGE
    if (fromDate) {
      const f = normalizeDate(fromDate);
      list = list.filter((exp) => {
        const expDate = normalizeDate(exp.created_at || "");
        return expDate && f && expDate >= f;
      });
    }

    if (toDate) {
      const t = normalizeDate(toDate);
      list = list.filter((exp) => {
        const expDate = normalizeDate(exp.created_at || "");
        return expDate && t && expDate <= t;
      });
    }

    // ↕ SORT
    if (sortConfig) {
      const { key, direction } = sortConfig;
      list.sort((a, b) => {
        const dir = direction === "asc" ? 1 : -1;

        const valA =
          key === "created_at"
            ? normalizeDate(a.created_at || "") || ""
            : (a[key] as any);
        const valB =
          key === "created_at"
            ? normalizeDate(b.created_at || "") || ""
            : (b[key] as any);

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }

    return list;
  }, [expenses, searchTerm, fromDate, toDate, sortConfig]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 150
      ) {
        setVisibleCount((prev) =>
          Math.min(prev + PAGE_SIZE, filteredAndSorted.length)
        );
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [filteredAndSorted.length]);

  const visibleExpenses = filteredAndSorted.slice(0, visibleCount);

  // SORT
  const handleSort = (key: keyof Expense) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key)
        return { key, direction: "asc" as const };
      return {
        key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const sortIndicator = (key: keyof Expense) =>
    sortConfig?.key === key ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : "";

  // =============================================
  // EXPORT HELPERS
  // =============================================
  const exportCSV = () => {
    if (!filteredAndSorted.length) return toast.error("No data to export");

    const header = "Date,Item,Qty,Amount\n";

    const rows = filteredAndSorted
      .map((e) => {
        const d = e.created_at
          ? new Date(e.created_at).toLocaleDateString()
          : "-";
        return `"${d}","${e.item}",${e.qty},${e.amount}`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    if (!filteredAndSorted.length) return toast.error("No data to export");

    const header = "Date,Item,Qty,Amount\n";

    const rows = filteredAndSorted
      .map((e) => {
        const d = e.created_at
          ? new Date(e.created_at).toLocaleDateString()
          : "-";
        return `"${d}","${e.item}",${e.qty},${e.amount}`;
      })
      .join("\n");

    const blob = new Blob([header + rows], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!filteredAndSorted.length) return toast.error("No data to export");

    const win = window.open("", "_blank");
    if (!win) return;

    const rows = filteredAndSorted
      .map((e) => {
        const d = e.created_at
          ? new Date(e.created_at).toLocaleDateString()
          : "-";
        return `
        <tr>
          <td>${d}</td>
          <td>${e.item}</td>
          <td>${e.qty}</td>
          <td>${e.amount}</td>
        </tr>`;
      })
      .join("");

    win.document.write(`
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 6px; border: 1px solid #ccc; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Expense Report</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  // =============================================
  // UI
  // =============================================

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setSortConfig(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">

      {/* PAGE TITLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
        📊 Expense Report
      </h1>
      {/* ADD EXPENSE */}
      <Button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base w-full sm:w-auto cursor-pointer"
      >
        <Plus className="w-4 h-4 mr-2" /> Add New Expense
      </Button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow border flex flex-wrap gap-4 items-end">

        {/* Search */}
        <input
          type="text"
          placeholder="Search"
          className="border rounded-lg px-3 sm:px-4 py-2 flex-1 min-w-[200px] text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Date */}
        <ModernRangePicker
          label="Date Range"
          value={{ from: fromDate ? new Date(fromDate) : undefined, to: toDate ? new Date(toDate) : undefined }}
          onChange={(range) => {
            const toLocalYmd = (d: Date) => {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              return `${yyyy}-${mm}-${dd}`;
            };

            setFromDate(range?.from ? toLocalYmd(range.from) : "");
            setToDate(range?.to ? toLocalYmd(range.to) : "");
          }}
        />

        {/* EXPORT & RESET */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mt-3">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              onClick={exportCSV}
            >
              Export CSV
            </Button>

            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
              onClick={exportXLSX}
            >
              Export XLSX
            </Button>

            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
              onClick={exportPDF}
            >
              Export PDF
            </Button>

          </div>

          <Button
            size="sm"
            variant="outline"
            className="bg-gray-200 hover:bg-gray-300 text-black text-xs sm:text-sm w-full sm:w-auto cursor-pointer"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th
                className="p-4 text-left cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Date {sortIndicator("created_at")}
              </th>

              <th
                className="p-4 text-left cursor-pointer"
                onClick={() => handleSort("item")}
              >
                Item {sortIndicator("item")}
              </th>

              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("qty")}
              >
                Qty {sortIndicator("qty")}
              </th>

              <th
                className="p-4 text-center cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount {sortIndicator("amount")}
              </th>

              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visibleExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No expenses found.
                </td>
              </tr>
            ) : (
              visibleExpenses.map((exp) => (
                <tr key={exp.id} className="border-t">

                  {/* EDIT MODE */}
                  {editingRowId === exp.id ? (
                    <>
                      <td className="p-4">
                        <input
                          disabled
                          value={
                            exp.created_at
                              ? new Date(exp.created_at).toLocaleDateString()
                              : "-"
                          }
                          className="border rounded-lg px-3 py-2 w-full bg-gray-100"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          name="item"
                          value={rowEditData.item}
                          onChange={handleRowChange}
                          className="border rounded-lg px-3 py-2 w-full"
                        />
                      </td>

                      <td className="p-4 text-center">
                        <input
                          type="number"
                          name="qty"
                          value={rowEditData.qty}
                          onChange={handleRowChange}
                          className="border rounded-lg px-3 py-2 w-full"
                        />
                      </td>

                      <td className="p-4 text-center">
                        <input
                          type="number"
                          name="amount"
                          value={rowEditData.amount}
                          onChange={handleRowChange}
                          className="border rounded-lg px-3 py-2 w-full"
                        />
                      </td>

                      <td className="p-4 flex justify-end gap-3">
                        <button
                          onClick={() => saveRowUpdate(exp.id!)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-100 cursor-pointer"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={cancelRowEdit}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    /* VIEW MODE */
                    <>
                      <td className="p-4">
                        {exp.created_at
                          ? new Date(exp.created_at).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-4">{exp.item}</td>

                      <td className="p-4 text-center">{exp.qty}</td>

                      <td className="p-4 text-center">
                        ₹{Number(exp.amount).toFixed(2)}
                      </td>

                      <td className="p-4 flex justify-end gap-3">
                        <button
                          onClick={() => startEditRow(exp)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 cursor-pointer"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => deleteRow(exp.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* scroll hint */}
        {visibleExpenses.length < filteredAndSorted.length && (
          <p className="text-center text-xs text-gray-400 py-3">
            Scroll down to load more...
          </p>
        )}
      </div>

      {/* ADD EXPENSE MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg bg-white text-black">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveExpense();
            }}
            className="space-y-4 [&_input]:bg-white [&_input]:text-black"
          >
            <div>
              <Label>Item</Label>
              <Input
                value={newExpense.item}
                onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
                placeholder="Enter item name"
              />
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={newExpense.qty}
                onChange={(e) => setNewExpense({ ...newExpense, qty: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="bg-gray-200 hover:bg-gray-300 text-black w-full sm:w-auto cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto cursor-pointer"
              >
                Save Expense
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
