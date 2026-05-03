import { useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigation } from "react-day-picker";

export default function ModernRangePicker({
  value,
  onChange,
  label,
  portalContainer,   // ✅ ADDED
}: any) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState(
    value || { from: undefined, to: undefined }
  );
  const confirmedSingleRef = useRef(false);

  useEffect(() => {
    setTempRange(value || { from: undefined, to: undefined });
  }, [value?.from, value?.to]);

  return (
    <div className="flex flex-col">
      {label && <label className="text-xs mb-1">{label}</label>}

      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen && confirmedSingleRef.current) {
            setTempRange({ from: undefined, to: undefined });
            confirmedSingleRef.current = false;
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[220px] justify-start text-left text-black hover:text-black bg-white hover:bg-slate-100 flex items-center gap-2 font-normal rounded-xl cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
            {(() => {
              const from = value?.from;
              const to = value?.to;
              if (from && to) {
                return `${format(from, "dd/MM/yyyy")} → ${format(to, "dd/MM/yyyy")}`;
              }
              if (from) {
                return format(from, "dd/MM/yyyy");
              }
              return "Select date range";
            })()}
          </Button>
        </PopoverTrigger>

        {/* === FIX: Use PopoverPortal with container === */}
        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            side="bottom"
            align="start"
            className="p-4 w-[320px] rounded-2xl shadow-xl border bg-white space-y-3 z-50"
          >

            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={(range) => {
                const nextRange = range || { from: undefined, to: undefined };
                setTempRange(nextRange);
                onChange?.(nextRange);
              }}
              numberOfMonths={1}
              className="rounded-md bg-slate-50"
              components={{
                Caption: ({ displayMonth }: any) => {
                  const { goToMonth, nextMonth, previousMonth } = useNavigation();

                  return (
                    <div className="flex items-center justify-between px-3 py-2">
                    {/* PREV BUTTON */}
                    <button
                      onClick={() => {
                        if (previousMonth) goToMonth(previousMonth);
                      }}
                      className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow transition cursor-pointer"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>

                    {/* MONTH + YEAR DROPDOWN */}
                    <div className="flex items-center gap-2">
                      <select
                        className="bg-transparent text-base font-medium focus:outline-none cursor-pointer"
                        value={displayMonth.getMonth()}
                        onChange={(e) => {
                          const d = new Date(displayMonth);
                          d.setMonth(Number(e.target.value));
                          goToMonth(d);
                        }}
                      >
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <option key={idx} value={idx}>
                            {new Date(2000, idx, 1).toLocaleString("en-US", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>

                      <select
                        className="bg-transparent text-base font-medium focus:outline-none cursor-pointer"
                        value={displayMonth.getFullYear()}
                        onChange={(e) => {
                          const d = new Date(displayMonth);
                          d.setFullYear(Number(e.target.value));
                          goToMonth(d);
                        }}
                      >
                        {Array.from({ length: 50 }).map((_, idx) => {
                          const year = 2000 + idx;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* NEXT BUTTON */}
                    <button
                      onClick={() => {
                        if (nextMonth) goToMonth(nextMonth);
                      }}
                      className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow transition cursor-pointer"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  );
                },
              }}
            />

            <div className="flex justify-between pt-1">
              <button className="text-black bg-slate-300 hover:bg-slate-400 cursor-pointer rounded-lg w-20 h-8 text-sm" onClick={() => setOpen(false)}>
                Cancel
              </button>

              <button
                className="text-gray-700 bg-cyan-300 hover:bg-cyan-400 cursor-pointer rounded-lg w-20 h-8 font-semibold text-sm"
                onClick={() => {
                  confirmedSingleRef.current = !!tempRange?.from && !tempRange?.to;
                  onChange(tempRange);
                  setOpen(false);
                }}
              >
                Confirm
              </button>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </Popover>
    </div>
  );
}
