'use client';

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Trash2, Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import ModernDatePicker from "@/components/ModernDatePicker";

// ================= TYPES =================
interface SavedBill {
  id: number;
  bill_Number: string;
  customer_name: string;
  payment_mode: string | null;
  status: string | null;
  bill_date: string;
  subtotal: number;

  // Optional, if backend sends them
  items_count?: number;
  items?: any[];
}

type SortKey =
  | "bill_no"
  | "customer_name"
  | "bill_date"
  | "subtotal"
  | "payment_mode"
  | "status"
  | "items_count";

interface SortConfig {
  key: SortKey;
  direction: "asc" | "desc";
}

interface BillItem {
  gsm_number: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

const PAGE_SIZE = 20;

const BillingList = () => {
  const router = useRouter();
  const [savedBills, setSavedBills] = useState<SavedBill[]>([]);

  // SEARCH + FILTER STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // SORT + INFINITE SCROLL
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const selectedDate = fromDate ? new Date(fromDate) : new Date();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  // ✅ FETCH BILLS
  const fetchBills = async () => {
    try {
      const res = await fetch("/api/billing");
      const data = await res.json();

      if (Array.isArray(data)) {
        // NEWEST FIRST
        const sorted = data.sort((a: SavedBill, b: SavedBill) => b.id - a.id);
        setSavedBills(sorted);
      } else {
        setSavedBills([]);
      }
    } catch (err) {
      console.error("Failed to load bills:", err);
      toast.error("Failed to load bills");
      setSavedBills([]);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // ✅ DELETE BILL
  const deleteBill = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      const res = await fetch(`/api/billing/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Bill deleted successfully");
        fetchBills();
      } else {
        toast.error("Failed to delete bill");
      }
    } catch (err) {
      toast.error("Server error while deleting");
    }
  };

  // ================= FORMAT / PARSE HELPERS =================
  const normalizeDate = (value: string) => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getSequentialBillNo = (index: number) => {
    return `INV-${String(savedBills.length - index).padStart(4, "0")}`;
  };

  const getItemsCount = (b: SavedBill) => {
    if (typeof b.items_count === "number") return b.items_count;
    if (Array.isArray(b.items)) return b.items.length;
    return "";
  };

  // ================= FILTER + SORT + SEARCH =================
  const filteredAndSortedBills = useMemo(() => {
    let list = [...savedBills];

    // 1) SEARCH
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();

      list = list.filter((bill) => {
        const billNo = getSequentialBillNo(list.indexOf(bill));
        const dateStr = new Date(bill.bill_date).toLocaleDateString();
        const itemsCount = String(getItemsCount(bill) || "");

        return (
          billNo.toLowerCase().includes(term) ||
          bill.customer_name.toLowerCase().includes(term) ||
          (bill.payment_mode || "").toLowerCase().includes(term) ||
          (bill.status || "").toLowerCase().includes(term) ||
          dateStr.toLowerCase().includes(term) ||
          String(bill.subtotal).includes(term) ||
          itemsCount.includes(term)
        );
      });
    }

    // 2) FILTERS
    if (filterStatus !== "All") {
      list = list.filter((b) => (b.status || "") === filterStatus);
    }

    if (filterPaymentMode !== "All") {
      list = list.filter((b) => (b.payment_mode || "") === filterPaymentMode);
    }

    if (fromDate) {
      const fromNorm = normalizeDate(fromDate);
      if (fromNorm) {
        list = list.filter((b) => {
          const billD = normalizeDate(b.bill_date);
          return billD && billD >= fromNorm;
        });
      }
    }

    if (toDate) {
      const toNorm = normalizeDate(toDate);
      if (toNorm) {
        list = list.filter((b) => {
          const billD = normalizeDate(b.bill_date);
          return billD && billD <= toNorm;
        });
      }
    }

    // 3) SORT
    if (sortConfig) {
      const { key, direction } = sortConfig;
      list.sort((a, b) => {
        const dir = direction === "asc" ? 1 : -1;

        const getValue = (bill: SavedBill) => {
          switch (key) {
            case "bill_no":
              return getSequentialBillNo(list.indexOf(bill));
            case "customer_name":
              return bill.customer_name || "";
            case "bill_date":
              return normalizeDate(bill.bill_date) || "";
            case "subtotal":
              return bill.subtotal;
            case "payment_mode":
              return bill.payment_mode || "";
            case "status":
              return bill.status || "";
            case "items_count":
              return Number(getItemsCount(bill)) || 0;
            default:
              return "";
          }
        };

        const valA = getValue(a);
        const valB = getValue(b);

        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }

    return list;
  }, [
    savedBills,
    searchTerm,
    filterStatus,
    filterPaymentMode,
    fromDate,
    toDate,
    sortConfig,
  ]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, filterStatus, filterPaymentMode, fromDate, toDate, savedBills.length]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) =>
          Math.min(prev + PAGE_SIZE, filteredAndSortedBills.length)
        );
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [filteredAndSortedBills.length]);

  const visibleBills = filteredAndSortedBills.slice(0, visibleCount);

  // ================= SORT HANDLER =================
  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      return {
        key,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  // ================= EXPORT HELPERS =================
  const buildCSV = (rows: SavedBill[]) => {
    const header = [
      "Bill No",
      "Customer",
      "Date",
      "Items",
      "Total",
      "Payment Mode",
      "Status",
    ];

    const body = rows.map((b, index) => {
      const billNo = getSequentialBillNo(index);
      const date = new Date(b.bill_date).toLocaleDateString();
      const itemsCount = getItemsCount(b);
      const total = Number(b.subtotal).toFixed(2);
      const payment = b.payment_mode || "";
      const status = b.status || "";

      const fields = [
        billNo,
        b.customer_name,
        date,
        itemsCount,
        total,
        payment,
        status,
      ];

      // Escape CSV
      return fields
        .map((field) =>
          `"${String(field ?? "").replace(/"/g, '""')}"`
        )
        .join(",");
    });

    return [header.join(","), ...body].join("\n");
  };

  const exportCSV = async () => {
    if (!filteredAndSortedBills.length) {
      toast.error("No data to export");
      return;
    }

    let rows: (string | number)[][] = [];
    rows.push([
      "Bill No",
      "Customer",
      "Date",
      "GSM",
      "Description",
      "Quantity",
      "Price",
      "Total",
      "Payment Mode",
      "Status"
    ]);

    // 🔥 Fetch items for each bill
    for (const bill of filteredAndSortedBills) {
      const billNo = bill.bill_Number || `INV-${String(bill.id).padStart(4, "0")}`;
      const date = new Date(bill.bill_date).toLocaleDateString();
      const payment = bill.payment_mode || "-";
      const status = bill.status || "-";

      let items: BillItem[] = [];
      try {
        const res = await fetch(`/api/billing/${bill.id}/items`);
        items = (await res.json()) as BillItem[];
      } catch (err) {
        console.log("Error fetching items for CSV:", err);
      }

      if (items.length === 0) {
        rows.push([
          billNo,
          bill.customer_name,
          date,
          "-",
          "-",
          "-",
          "-",
          "-",
          payment,
          status
        ]);
      } else {
        items.forEach(item => {
          rows.push([
            billNo,
            bill.customer_name,
            date,
            item.gsm_number || "-",
            item.description || "-",
            item.quantity || 0,
            item.price || 0,
            item.total || 0,
            payment,
            status
          ]);
        });
      }
    }

    // Convert to CSV
    const csv = rows.map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing_items.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ⭐ EXPORT XLSX (Excel-friendly CSV trick)
  const exportXLSX = async () => {
    if (!filteredAndSortedBills.length) {
      toast.error("No data to export");
      return;
    }

    let rows: (string | number)[][] = [];
    rows.push([
      "Bill No",
      "Customer",
      "Date",
      "GSM",
      "Description",
      "Quantity",
      "Price",
      "Total",
      "Payment Mode",
      "Status"
    ]);

    // 🔥 Fetch items for each bill
    for (const bill of filteredAndSortedBills) {
      const billNo = bill.bill_Number || `INV-${String(bill.id).padStart(4, "0")}`;
      const date = new Date(bill.bill_date).toLocaleDateString();
      const payment = bill.payment_mode || "-";
      const status = bill.status || "-";

      let items: BillItem[] = [];
      try {
        const res = await fetch(`/api/billing/${bill.id}/items`);
        items = (await res.json()) as BillItem[];
      } catch (err) {
        console.log("Error fetching items for Excel:", err);
      }

      if (items.length === 0) {
        rows.push([
          billNo,
          bill.customer_name,
          date,
          "-",
          "-",
          "-",
          "-",
          "-",
          payment,
          status
        ]);
      } else {
        items.forEach(item => {
          rows.push([
            billNo,
            bill.customer_name,
            date,
            item.gsm_number || "-",
            item.description || "-",
            item.quantity || 0,
            item.price || 0,
            item.total || 0,
            payment,
            status
          ]);
        });
      }
    }

    // Excel-friendly CSV
    const csv = rows.map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing_items.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    if (!filteredAndSortedBills.length) {
      toast.error("No data to export");
      return;
    }

    const win = window.open("", "_blank");
    if (!win) return;

    const tableRows: string[] = [];

    for (const bill of filteredAndSortedBills) {
      const billNo = bill.bill_Number || `INV-${String(bill.id).padStart(4, "0")}`;
      const date = new Date(bill.bill_date).toLocaleDateString();
      const payment = bill.payment_mode || "-";
      const status = bill.status || "-";

      // 🔥 FETCH REAL ITEMS FOR THIS BILL
      let items: BillItem[] = [];
      try {
        const res = await fetch(
          `/api/billing/${bill.id}/items`
        );
        items = (await res.json()) as BillItem[];
      } catch (err) {
        console.log("Error loading items for bill:", bill.id);
      }

      // ITEM ROWS (if items exist)
      if (items.length > 0) {
        items.forEach((item, index) => {
          tableRows.push(`
            <tr>
              ${
                index === 0
                  ? `
                <td rowspan="${items.length}">${billNo}</td>
                <td rowspan="${items.length}">${bill.customer_name}</td>
                <td rowspan="${items.length}">${date}</td>
              `
                  : ""
              }

              <td>${item.gsm_number || "-"}</td>
              <td>${item.description || "-"}</td>
              <td>${item.quantity || 0}</td>
              <td>${Number(item.price).toFixed(2)}</td>
              <td>${Number(item.total).toFixed(2)}</td>

              ${
                index === 0
                  ? `
                <td rowspan="${items.length}">${payment}</td>
                <td rowspan="${items.length}">${status}</td>
              `
                  : ""
              }
            </tr>
          `);
        });
      } else {
        // NO ITEMS AVAILABLE → fallback
        tableRows.push(`
          <tr>
            <td>${billNo}</td>
            <td>${bill.customer_name}</td>
            <td>${date}</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>${payment}</td>
            <td>${status}</td>
          </tr>
        `);
      }
    }

    win.document.write(`
      <html>
      <head>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
          th { background: #f3f4f6; }
          body { font-family: Arial; padding: 20px; }
        </style>
      </head>
      <body>
        <h1>Billing List</h1>
        <table>
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>GSM</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Payment Mode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows.join("")}
          </tbody>
        </table>
      </body>
      </html>
    `);

    win.document.close();
    win.print();
  };

  // OPTIONS FOR FILTER DROPDOWNS
  const statusOptions = Array.from(
    new Set(
      savedBills
        .map((b) => b.status)
        .filter((v): v is string => !!v)
    )
  );

  const paymentModeOptions = Array.from(
    new Set(
      savedBills
        .map((b) => b.payment_mode)
        .filter((v): v is string => !!v)
    )
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterPaymentMode("All");
    setFromDate("");
    setToDate("");
    setSortConfig(null);
  };

  return (
    <div className="p-10 w-full space-y-10">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🧾 Billing Section
        </h1>

        {/* TOP RIGHT: ADD BILL BUTTON */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/billing/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded-lg shadow"
          >
            + Add New Bill
          </Button>
        </div>
      </div>

      {/* SEARCH + FILTER BAR */}
      <div className="border rounded-2xl p-5 bg-white shadow-sm">
        <div className="flex flex-wrap items-end gap-6">

          {/* SEARCH */}
          <div className="flex flex-col flex-1 min-w-[240px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-4 py-2 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
          </div>

          {/* DATE RANGE PICKER */}
          <div className="flex flex-col min-w-[220px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Date mm/dd/yyyy</label>
            <ModernDatePicker
              label=""
              value={{
                from: fromDate ? new Date(fromDate) : undefined,
                to: toDate ? new Date(toDate) : undefined,
              }}
              onChange={(range) => {
                setFromDate(range?.from ? range.from.toISOString().split("T")[0] : "");
                setToDate(range?.to ? range.to.toISOString().split("T")[0] : "");
              }}
            />
          </div>

          {/* Payment Mode */}
          <div className="flex flex-col min-w-[160px]">
            <label className="text-xs font-medium text-gray-600 mb-1">Payment Mode</label>
            <select
              value={filterPaymentMode}
              onChange={(e) => setFilterPaymentMode(e.target.value)}
              className="border px-3 py-2 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-300 outline-none"
            >
              <option value="All">All</option>
              {paymentModeOptions.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
            </div>
          </div>
        </div>

        {/* EXPORT & CLEAR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={exportCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={exportXLSX}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Export XLSX
            </Button>
            <Button
              size="sm"
              onClick={exportPDF}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Export PDF
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-gray-300"
          >
            Clear Filters
          </Button>
        </div>

      {/* TABLE */}
      <div className="border rounded-lg p-6 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4">Saved Bills</h2>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("bill_no")}
              >
                Bill No{getSortIndicator("bill_no")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("customer_name")}
              >
                Customer{getSortIndicator("customer_name")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("bill_date")}
              >
                Date (MM/DD/YYYY){getSortIndicator("bill_date")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("subtotal")}
              >
                Total{getSortIndicator("subtotal")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("payment_mode")}
              >
                Payment Mode{getSortIndicator("payment_mode")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status{getSortIndicator("status")}
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleBills.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
                  No bills found. Try changing filters or create one using
                  “Add New Bill”.
                </TableCell>
              </TableRow>
            ) : (
              visibleBills.map((b, index) => {
                const billNo = getSequentialBillNo(index);
                const itemsCount = getItemsCount(b);

                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium text-blue-600">
                      {billNo}
                    </TableCell>

                    <TableCell>{b.customer_name}</TableCell>

                    <TableCell>
                      {new Date(b.bill_date).toLocaleDateString()}
                    </TableCell>

                    <TableCell>₹{Number(b.subtotal).toFixed(2)}</TableCell>

                    <TableCell>{b.payment_mode || "-"}</TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-white text-xs ${
                          b.status === "Paid"
                            ? "bg-green-600"
                            : b.status === "Unpaid"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }`}
                      >
                        {b.status === "Pending" ? "New Invoice" : b.status}
                      </span>
                    </TableCell>

                    <TableCell className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/billing/view/${b.id}`)}
                        className="bg-blue-500 text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => router.push(`/billing/edit/${b.id}`)}
                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteBill(b.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Small hint for infinite scroll */}
        {visibleBills.length < filteredAndSortedBills.length && (
          <p className="text-center text-xs text-gray-400 mt-3">
            Scroll down to load more...
          </p>
        )}
      </div>
    </div>
  );
};

export default BillingList;
