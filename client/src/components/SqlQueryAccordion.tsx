import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ChevronDown } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const SqlQueryAccordion = ({
  sqlQuery,
}: {
  sqlQuery: string | undefined;
}) => {
  return (
    <Accordion type="single" collapsible className="w-full mb-6">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-2xl cursor-pointer font-semibold flex flex-1 items-center justify-between py-4 transition-all hover:no-underline group [&>svg:last-child]:hidden">
          <div className="flex items-center">
            <ChevronDown className="m-1 h-4 w-4 mr-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            SQL Query
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <SyntaxHighlighter
            language="sql"
            style={coldarkDark}
            className="rounded-md"
          >
            {sqlQuery ||
              "// SQL query will appear here once you submit a query."}
          </SyntaxHighlighter>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
