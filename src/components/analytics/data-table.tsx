"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TableData } from "@/types";

interface DataTableProps {
  data: TableData;
  maxRows?: number;
}

export function DataTable({ data, maxRows = 10 }: DataTableProps) {
  const displayRows = data.rows.slice(0, maxRows);
  const hasMore = data.rows.length > maxRows;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            {data.columns.map((col) => (
              <TableHead 
                key={col.key} 
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground h-10"
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRows.map((row, rowIndex) => (
            <TableRow 
              key={rowIndex}
              className="border-b border-muted/50 last:border-0"
            >
              {data.columns.map((col, colIndex) => (
                <TableCell 
                  key={col.key}
                  className={`py-3 ${colIndex === 0 ? "font-medium" : ""} ${
                    typeof row[col.key] === "number" ? "tabular-nums text-right" : ""
                  }`}
                >
                  {formatCellValue(row[col.key], col.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasMore && (
        <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/20 border-t">
          Showing {maxRows} of {data.rows.length} rows
        </div>
      )}
    </div>
  );
}

function formatCellValue(value: unknown, key?: string): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    // Check if it looks like currency (key contains revenue, cost, value, etc.)
    const isCurrency = key && /revenue|cost|value|price|amount|spend|budget/i.test(key);
    if (isCurrency || value > 1000) {
      return `$${value.toLocaleString()}`;
    }
    // Check if it looks like a percentage
    if (key && /rate|percent|ratio|roas/i.test(key)) {
      return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${key.toLowerCase().includes("roas") ? "x" : "%"}`;
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}
