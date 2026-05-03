import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStock } from "@/api/stock";
import { toast } from "sonner";
import { SparePart } from "@/types/SparePart";

interface EditPartDialogProps {
  part: SparePart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPartUpdated: () => void;
}

export default function EditPartDialog({
  part,
  open,
  onOpenChange,
  onPartUpdated,
}: EditPartDialogProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    gsm_number: "",
    category: "",
    description: "",
    manufacturer: "",
    stock: "",
    selling_price: "",
    cost_price: "",
    minimum_stock: "",
    unit: "",
    kg: "",
    amount: "",
  });

  /* -----------------------------------------------------
     LOAD EXISTING DATA WHEN EDIT POPUP OPENS
  ----------------------------------------------------- */
  useEffect(() => {
    if (open && part) {
      setFormData({
        gsm_number: String(part.gsm_number),
        category: part.category,
        description: part.description || "",
        manufacturer: part.manufacturer || "",
        stock: String(part.stock),
        selling_price: String(part.selling_price),
        cost_price: String(part.cost_price),
        minimum_stock: String(part.minimum_stock),
        unit: part.unit || "piece",
        kg: part.kg ? String(part.kg) : "",
        amount: part.amount ? String(part.amount) : "",
      });
    }
  }, [open, part]);

  /* -----------------------------------------------------
     AUTO-CALCULATE COST PRICE FROM KG & AMOUNT
  ----------------------------------------------------- */
  useEffect(() => {
    const kg = parseFloat(formData.kg);
    const amount = parseFloat(formData.amount);

    if (!kg || !amount) return;

    const costFor100g = (amount / (kg * 1000)) * 100;
    setFormData((prev) => ({
      ...prev,
      cost_price: costFor100g.toFixed(2),
    }));
  }, [formData.kg, formData.amount]);

  /* -----------------------------------------------------
     SAVE CHANGES (UPDATE STOCK)
  ----------------------------------------------------- */
  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedStock = {
        gsm_number: Number(formData.gsm_number),
        category: formData.category,
        description: formData.description,
        manufacturer: formData.manufacturer,
        stock: Number(formData.stock),
        selling_price: Number(formData.selling_price),
        cost_price: Number(formData.cost_price),
        minimum_stock: Number(formData.minimum_stock),
        unit: formData.unit,
        kg: formData.kg ? Number(formData.kg) : null,
        amount: formData.amount ? Number(formData.amount) : null,
      };

      await updateStock(part.id, updatedStock);

      toast.success("Stock updated successfully!");
      onPartUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error("UPDATE STOCK ERROR:", err);
      toast.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Edit Stock Item</DialogTitle>
          <DialogDescription>
            Update the details for this stock item. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4">

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>GSM Number</Label>
              <Input
                value={formData.gsm_number}
                onChange={(e) =>
                  setFormData({ ...formData, gsm_number: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Category</Label>
              <select
                className="border rounded-md p-2 w-full bg-background text-foreground"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                <option value="Soft">Soft</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <select
              className="border rounded-md p-2 w-full bg-background text-foreground"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            >
              <option value="">Select Description</option>
              <option value="Light Green Packet">Light Green Packet</option>
              <option value="Dark Green Packet">Dark Green Packet</option>
            </select>
          </div>

          {/* Manufacturer */}
          <div>
            <Label>Manufacturer</Label>
            <Input
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, manufacturer: e.target.value })
              }
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Selling Price</Label>
              <Input
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Cost Price</Label>
              <Input
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: e.target.value })
                }
              />
            </div>
          </div>

          {/* Row 3: Min Stock + Unit */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Stock</Label>
              <Input
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Minimum Stock</Label>
              <Input
                value={formData.minimum_stock}
                onChange={(e) =>
                  setFormData({ ...formData, minimum_stock: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Unit</Label>
              <Input
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>
          </div>

          {/* Row 4: KG + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>KG</Label>
              <Input
                value={formData.kg}
                onChange={(e) =>
                  setFormData({ ...formData, kg: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={loading} className="bg-green-600 text-white hover:bg-green-700">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
