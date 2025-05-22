import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useHistory } from "../contexts/HistoryContext";

export function ResultsTable() {
  const { currentQuery } = useHistory();
  const data = currentQuery?.results || [];

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-center">
        No data to display, or query returned empty results.
      </p>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="mt-2 border rounded-md overflow-x-auto">
      <Table>
        <TableHeader className="font-bold border-b">
          <TableRow className="bg-muted/30">
            {headers.map((header) => (
              <TableHead key={header} className="font-bold">
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
