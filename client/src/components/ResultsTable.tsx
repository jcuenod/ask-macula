import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { type DataRow } from "../services/apiService";

interface ResultsTableProps {
  data: DataRow[];
}

export function ResultsTable({ data }: ResultsTableProps) {
  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-center">
        No data to display, or query returned empty results.
      </p>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader className="font-bold border-b">
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>
                {header
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`}>
                  {String(row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
