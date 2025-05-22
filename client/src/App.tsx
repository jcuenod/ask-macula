import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Download, Table2 } from "lucide-react";
import { ResultsTable } from "./components/ResultsTable";
import { HistorySidebar } from "./components/HistorySidebar";
import { initiateCsvDownload } from "./lib/download";
import { VisualizationContainer } from "./components/VisualizationContainer";
import { SqlQueryAccordion } from "./components/SqlQueryAccordion";
import { useQueryApi } from "./contexts/QueryApiContext";
import { useHistory } from "./contexts/HistoryContext";
import { UserQuery } from "./components/UserQuery";

export const App = () => {
  const { currentQuery } = useHistory();

  const [activeTab, setActiveTab] = useState<string>("raw-data");
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] =
    useState(0);

  const [_, { isLoading, error }, clearError] = useQueryApi();

  const loadingMessages = [
    "Analyzing query...",
    "Evaluating source data...",
    "Gathering results...",
    "Processing results...",
    "Compiling information...",
  ];

  useEffect(() => {
    let intervalId: number;
    if (isLoading) {
      setCurrentLoadingMessageIndex(0);
      intervalId = window.setInterval(() => {
        setCurrentLoadingMessageIndex(
          (prevIndex) => (prevIndex + 1) % loadingMessages.length
        );
      }, 2000);
    }
    return () => clearInterval(intervalId);
  }, [isLoading, loadingMessages.length]);

  useEffect(() => {
    if (!currentQuery?.jsVisualizationCode) {
      setActiveTab("raw-data");
    }
    clearError();
  }, [currentQuery]);

  const handleDownloadCSV = () => {
    if (!currentQuery || !currentQuery.results.length) {
      console.warn("No data to download.");
      return;
    }
    initiateCsvDownload(currentQuery);
  };

  return (
    <div className="w-screen flex bg-background text-foreground">
      <HistorySidebar />
      <main className="flex-1 p-6 flex flex-col relative overflow-auto">
        <UserQuery />
        <div className="relative flex-grow flex flex-col relative">
          <div
            className={`relative w-full flex flex-col flex-grow transition-transform transition-opacity origin-top duration-300 ease-in-out ${
              isLoading ? "scale-95 opacity-70 pointer-events-none" : ""
            }`}
          >
            <SqlQueryAccordion sqlQuery={currentQuery?.sqlQuery} />
            <div className="space-y-4 flex-grow flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Table2 className="h-6 w-6 mr-2" />
                  <h2 className="text-2xl font-semibold">Results</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownloadCSV}
                  disabled={
                    !currentQuery ||
                    !currentQuery.results ||
                    currentQuery.results.length === 0
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full flex-grow flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="raw-data">Raw Data</TabsTrigger>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                </TabsList>
                <TabsContent value="raw-data" className="flex-grow">
                  {error && (
                    <p className="text-destructive p-4 text-center">
                      Error: {error}
                    </p>
                  )}
                  {!error && <ResultsTable />}
                </TabsContent>
                <TabsContent
                  value="visualization"
                  className="space-y-4 flex-grow"
                >
                  <VisualizationContainer />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"></div>
          )}
        </div>
        {isLoading && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground text-2xl font-semibold p-5 text-center z-[51] animate-in fade-in zoom-in-95 duration-300">
            {loadingMessages[currentLoadingMessageIndex]}
          </div>
        )}
      </main>
    </div>
  );
};
