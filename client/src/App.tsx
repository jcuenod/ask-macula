import { useState, useEffect, type KeyboardEvent } from "react";
import "./App.css";
import { Input } from "./components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ChevronDown, Download, Table2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Visualization } from "./components/Visualization";
import {
  submitNaturalLanguageQuery,
  type QueryServiceResponse,
  fetchVisualizationCode,
} from "./services/apiService";
import { ResultsTable } from "./components/ResultsTable";
import {
  type HistoryEntry,
  addHistoryEntry,
  getHistoryEntries,
  clearHistory as clearHistoryStorage,
  updateHistoryEntryVisualization,
  deleteHistoryEntry, // Import deleteHistoryEntry
} from "./lib/historyManager";
import { HistorySidebar } from "./components/HistorySidebar";
import { initiateCsvDownload } from "./lib/download";

function App() {
  const [currentHistoryItem, setCurrentHistoryItem] =
    useState<HistoryEntry | null>(null);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingVisualization, setIsLoadingVisualization] =
    useState<boolean>(false);
  const [visualizationError, setVisualizationError] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>("raw-data");

  useEffect(() => {
    setHistoryEntries(getHistoryEntries());
  }, []);

  const handleQuerySubmit = async () => {
    if (!naturalLanguageInput.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response: QueryServiceResponse = await submitNaturalLanguageQuery(
        naturalLanguageInput
      );

      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        naturalLanguageQuery: naturalLanguageInput,
        sqlQuery: response.sql_query,
        results: response.results,
        timestamp: Date.now(),
      };
      addHistoryEntry(newEntry);
      setHistoryEntries((prevEntries) =>
        [newEntry, ...prevEntries].slice(0, 50)
      );
      setCurrentHistoryItem(newEntry);
      setActiveTab("raw-data"); // New queries default to raw data tab
      setVisualizationError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryEntry) => {
    setCurrentHistoryItem(item);
    setNaturalLanguageInput(item.naturalLanguageQuery);
    setError(null);
    setVisualizationError(null);
    if (!item.jsVisualizationCode) {
      setActiveTab("raw-data");
    }
  };

  const handleClearHistory = () => {
    clearHistoryStorage();
    setHistoryEntries([]);
    setCurrentHistoryItem(null);
    setNaturalLanguageInput(""); // Clear input field
    setVisualizationError(null);
  };

  const handleDeleteHistoryItem = (entryId: string) => {
    deleteHistoryEntry(entryId);
    const currentIndex = historyEntries.findIndex(
      (entry) => entry.id === entryId
    );
    const updatedEntries = historyEntries.filter(
      (entry) => entry.id !== entryId
    );
    setHistoryEntries(updatedEntries);

    if (currentHistoryItem?.id === entryId) {
      const adjacentItem =
        currentIndex > 0 ? updatedEntries[currentIndex - 1] : updatedEntries[0];
      if (adjacentItem) {
        setCurrentHistoryItem(adjacentItem);
        setNaturalLanguageInput(adjacentItem.naturalLanguageQuery);
      } else {
        setCurrentHistoryItem(null);
        setNaturalLanguageInput("");
      }
    }

    if (updatedEntries.length === 0) {
      setCurrentHistoryItem(null);
      setNaturalLanguageInput("");
    } else if (
      currentHistoryItem?.id === entryId &&
      updatedEntries.length > 0
    ) {
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleQuerySubmit();
    }
  };

  const handleGenerateVisualization = async () => {
    if (
      !currentHistoryItem ||
      !currentHistoryItem.sqlQuery ||
      !currentHistoryItem.results.length
    ) {
      setVisualizationError(
        "Cannot generate visualization without an active query and results."
      );
      return;
    }

    setIsLoadingVisualization(true);
    setVisualizationError(null);
    try {
      const response = await fetchVisualizationCode(
        currentHistoryItem.naturalLanguageQuery,
        currentHistoryItem.sqlQuery
      );
      const jsCode = response.js_code;

      try {
        // The prompt implies an eval check: "assuming no error occurs when eval-ing it"
        // In a real app, this step needs careful consideration for security.
        // For this exercise, we proceed with a direct eval as a check.
        // eslint-disable-next-line no-eval
        new Function("results", jsCode);

        // If eval didn't throw, proceed to store and update
        updateHistoryEntryVisualization(currentHistoryItem.id, jsCode);
        setHistoryEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === currentHistoryItem.id
              ? { ...entry, jsVisualizationCode: jsCode }
              : entry
          )
        );
        setCurrentHistoryItem((prev) =>
          prev ? { ...prev, jsVisualizationCode: jsCode } : null
        );
        setVisualizationError(null);
      } catch (evalError) {
        console.error("Error evaluating visualization code:", evalError);
        setVisualizationError(
          evalError instanceof Error
            ? `Invalid visualization code: ${evalError.message}`
            : "Invalid visualization code provided by server."
        );
      }
    } catch (fetchErr) {
      setVisualizationError(
        fetchErr instanceof Error
          ? fetchErr.message
          : "Failed to fetch visualization."
      );
    } finally {
      setIsLoadingVisualization(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!currentHistoryItem || !currentHistoryItem.results.length) {
      // Optionally show a notification to the user
      console.warn("No data to download.");
      return;
    }
    initiateCsvDownload(currentHistoryItem);
  };

  return (
    <div className="flex bg-background text-foreground">
      {/* Sidebar */}
      <HistorySidebar
        historyEntries={historyEntries}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        activeHistoryItemId={currentHistoryItem?.id || null}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col">
        <div className="mb-6">
          {/* User Input Field */}
          <Input
            type="text"
            placeholder="Enter your natural language query and press Enter..."
            className="w-full text-xl p-6 h-16 shadow-sm"
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={isLoading}
          />
        </div>

        {/* SQL Query Accordion */}
        <Accordion type="single" collapsible className="w-full mb-6">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-2xl font-semibold flex flex-1 items-center justify-between py-4 transition-all hover:no-underline group [&>svg:last-child]:hidden">
              <div className="flex items-center cursor-pointer">
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
                {isLoading && !currentHistoryItem?.sqlQuery
                  ? "Generating SQL query..."
                  : currentHistoryItem?.sqlQuery ||
                    "// SQL query will appear here once you submit a query."}
              </SyntaxHighlighter>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Table2 className="h-6 w-6 mr-2" />{" "}
              {/* Adjusted icon size and margin */}
              <h2 className="text-2xl font-semibold">Results</h2>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={
                !currentHistoryItem || currentHistoryItem.results.length === 0
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
            </TabsList>
            <TabsContent value="raw-data">
              {isLoading && (
                <p className="text-center p-4">Loading results...</p>
              )}
              {error && (
                <p className="text-destructive p-4 text-center">
                  Error: {error}
                </p>
              )}
              {!isLoading &&
                !error &&
                (activeTab === "raw-data" ? (
                  <ResultsTable data={currentHistoryItem?.results || []} />
                ) : (
                  "Loading Data..."
                ))}
            </TabsContent>
            <TabsContent value="visualization" className="space-y-4">
              {!currentHistoryItem?.jsVisualizationCode &&
                !isLoadingVisualization &&
                !visualizationError && (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                      Generate a visualization based on the current query
                      results.
                    </p>
                    <Button
                      onClick={handleGenerateVisualization}
                      disabled={
                        !currentHistoryItem?.sqlQuery ||
                        currentHistoryItem?.results.length === 0 ||
                        isLoadingVisualization
                      }
                    >
                      Generate Visualization
                    </Button>
                  </div>
                )}
              {isLoadingVisualization && (
                <p className="text-center p-4">Generating visualization...</p>
              )}
              {visualizationError && (
                <div className="text-destructive p-4 text-center space-y-2">
                  <p>Error: {visualizationError}</p>
                  <Button
                    onClick={handleGenerateVisualization}
                    disabled={
                      !currentHistoryItem?.sqlQuery ||
                      currentHistoryItem?.results.length === 0 ||
                      isLoadingVisualization
                    }
                    variant="outline"
                  >
                    Retry Generation
                  </Button>
                </div>
              )}
              {currentHistoryItem?.jsVisualizationCode &&
                !visualizationError && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleGenerateVisualization}
                      disabled={isLoadingVisualization}
                      variant="outline"
                      size="sm"
                      className="mb-2"
                    >
                      Regenerate Visualization
                    </Button>
                    <Visualization
                      code={currentHistoryItem?.jsVisualizationCode}
                      results={currentHistoryItem?.results || []}
                    />
                  </div>
                )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default App;
