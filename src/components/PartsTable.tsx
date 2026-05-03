// src/components/PartsTable.tsx

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import EditPartDialog from "./EditPartDialog";

import { deleteStock } from "@/api/stock";
import { SparePart } from "@/types/SparePart";

interface PartsTableProps {
  parts: SparePart[];
  onUpdate: () => void; // refresh Dashboard parent
}

export default function PartsTable({ parts, onUpdate }: PartsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localParts, setLocalParts] = useState<SparePart[]>(parts);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  // Sync local table any time parent updates
  useEffect(() => {
    setLocalParts(parts);
  }, [parts]);

  // 🔍 Search filter
  const filteredParts = localParts.filter((part) => {
    const s = searchTerm.toLowerCase();
    return (
      part.gsm_number.toString().includes(s) ||
      part.category.toLowerCase().includes(s) ||
      (part.manufacturer?.toLowerCase() || "").includes(s)
    );
  });

  /* ---------------------------------------------
     DELETE FROM MYSQL
  --------------------------------------------- */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this stock item?")) return;

    try {
      await deleteStock(id);

      toast.success("🗑️ Stock item deleted");

      onUpdate(); // refresh MySQL stock from parent
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by GSM number, category, or manufacturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>GSM</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Kg</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredParts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No stock items found
                </TableCell>
              </TableRow>
            ) : (
              filteredParts.map((part) => (
                <TableRow key={part.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {part.gsm_number}
                  </TableCell>

                  <TableCell>{part.category}</TableCell>

                  <TableCell>{part.description || "-"}</TableCell>

                  <TableCell>{part.manufacturer || "-"}</TableCell>

                  <TableCell>{part.stock}</TableCell>

                  <TableCell>₹{part.cost_price}</TableCell>

                  <TableCell>₹{part.selling_price}</TableCell>

                  <TableCell>{part.kg || "-"}</TableCell>

                  <TableCell>{part.amount || "-"}</TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* EDIT */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPart(part)}
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* DELETE */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(part.id)}
                        className="cursor-pointer hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingPart && (
        <EditPartDialog
          part={editingPart}
          open={!!editingPart}
          onOpenChange={(open) => !open && setEditingPart(null)}
          onPartUpdated={onUpdate}
        />
      )}
    </div>
  );
}
