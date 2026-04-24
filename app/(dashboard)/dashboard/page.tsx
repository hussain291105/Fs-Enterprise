  'use client';

  import { useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';

  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
  import { AlertTriangle } from 'lucide-react';

  import PartsTable from '@/components/PartsTable';
  import AddPartDialog from '@/components/AddPartDialog';

  import { SparePart } from '@/types/SparePart';
  import { getStock } from '@/api/stock';

  export default function Dashboard() {
    const router = useRouter();

    const [stock, setStock] = useState<SparePart[]>([]);
    const [loading, setLoading] = useState(true);

    /* --------------------------------------------------------
      FETCH STOCK FROM MYSQL
    -------------------------------------------------------- */
    const loadStock = async () => {
      try {
        setLoading(true);
        const data = await getStock();
        setStock(data);
      } catch (err) {
        console.error('Error fetching stock:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadStock();
    }, []);

    /* --------------------------------------------------------
      CALCULATIONS
    -------------------------------------------------------- */

    const totalParts = stock.length;

    const inventoryValue = stock.reduce(
      (sum, p) => sum + Number(p.cost_price || 0) * Number(p.stock || 0),
      0
    );

    const totalProfit = stock.reduce((sum, p) => {
      const cost = Number(p.cost_price);
      const sell = Number(p.selling_price);
      return sum + (sell - cost) * Number(p.stock);
    }, 0);

    const lowStockParts = stock.filter(
      (p) => Number(p.stock) < (p.minimum_stock ?? 10)
    );

    const lowStockCount = lowStockParts.length;

    return (
      <div className="space-y-8">

        {/* HEADER BANNER (MATCH YOUR DESIGN) */}
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <img src="/ezzylogo.png" className="mx-auto w-72 mb-4" />
          <h1 className="text-3xl font-bold">
            Welcome to Fresh Soft Tissue Enterprises
          </h1>
          <p className="text-gray-500 mt-2">
            Freshness you can feel, softness you can trust.
          </p>
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Stock Inventory</h2>

          {/* Add Stock Button */}
          <AddPartDialog onPartAdded={loadStock} />
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>Total Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalParts}</p>
              <p className="text-muted-foreground">Items in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₹{inventoryValue.toFixed(2)}
              </p>
              <p className="text-muted-foreground">Total value</p>
            </CardContent>
          </Card>

          {/* PROFIT (Clickable) */}
          <div
            className="cursor-pointer"
            onClick={() => router.push('/reports')}
          >
            <Card className="hover:shadow-lg transition rounded-lg border hover:border-green-500">
              <CardHeader>
                <CardTitle>Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  ₹{totalProfit.toFixed(2)}
                </p>
                <p className="text-muted-foreground">
                  Estimated total profit
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="cursor-pointer hover:shadow-lg transition rounded-lg">
            <CardHeader className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-500 w-5 h-5" />
              <CardTitle>Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{lowStockCount}</p>
              <p className="text-muted-foreground">
                Items below threshold
              </p>
            </CardContent>
          </Card>

        </div>

        {/* LOW STOCK ALERT */}
        {lowStockCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-3">
              Items That Need Reordering
            </h2>

            <ul className="list-disc pl-5 text-gray-700">
              {lowStockParts.map((p) => (
                <li key={p.id}>
                  {p.category} — GSM {p.gsm_number}
                  (Stock: {p.stock}, Min: {p.minimum_stock ?? 10})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TABLE */}
        <div>
          <h2 className="text-xl font-semibold mt-8 mb-4">
            All Stock Data
          </h2>

          {loading ? (
            <p className="text-center text-muted-foreground py-4">
              Loading stock...
            </p>
          ) : (
            <PartsTable parts={stock} onUpdate={loadStock} />
          )}
        </div>

      </div>
    );
  }