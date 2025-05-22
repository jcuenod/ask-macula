import { useEffect, useState } from "react";
import { Chart } from "./Chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useVisualizationApi } from "../hooks/useVisualizationApi";
import { useHistory } from "../contexts/HistoryContext";

const promptedVisualization = (original: string, prompt: string) => {
  return `Original Query:\n\n> ${original}\n\nAdditional Prompt:\n\n> ${prompt}`;
};

export const VisualizationContainer = () => {
  const { currentQuery, updateQueryViz } = useHistory();

  const [
    generateVisualization,
    {
      jsCode: fetchedJsCode,
      isLoading: isLoadingVisualization,
      error: visualizationApiError, // Renamed to avoid conflict
    },
    clearError,
  ] = useVisualizationApi();

  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [internalEvaluationError, setInternalEvaluationError] = useState<
    string | null
  >(null);

  useEffect(() => {
    setInternalEvaluationError(null);
    clearError();
  }, [currentQuery?.id]);

  useEffect(() => {
    if (
      fetchedJsCode &&
      currentQuery &&
      currentQuery.jsVisualizationCode !== fetchedJsCode
    ) {
      // Ensure item is not null
      try {
        // eslint-disable-next-line no-eval
        new Function("results", fetchedJsCode);
        updateQueryViz(currentQuery.id, fetchedJsCode);
        setInternalEvaluationError(null);
      } catch (evalError) {
        console.error("Error evaluating visualization code:", evalError);
        setInternalEvaluationError(
          evalError instanceof Error
            ? `Invalid visualization code: ${evalError.message}`
            : "Invalid visualization code provided by server."
        );
      }
    }
  }, [fetchedJsCode, currentQuery, updateQueryViz]);

  const handleGenerateVisualization = async (userQueryOverride?: string) => {
    if (
      !currentQuery ||
      !currentQuery.sqlQuery ||
      !currentQuery.results ||
      currentQuery.results.length === 0
    ) {
      setInternalEvaluationError(
        "Cannot generate visualization without an active query and results."
      );
      return;
    }
    setInternalEvaluationError(null);

    const queryToUse = userQueryOverride || currentQuery.naturalLanguageQuery;
    await generateVisualization(queryToUse, currentQuery.sqlQuery);
  };

  const displayError = visualizationApiError || internalEvaluationError;

  if (
    !currentQuery ||
    !currentQuery.results ||
    currentQuery.results.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground">
          No data available to visualize. Run a query and select it from
          history.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-grow flex flex-col p-4 min-h-[300px]">
      {/* Actual Content Area */}
      <div className="flex-grow flex flex-col">
        {!currentQuery.jsVisualizationCode &&
          !isLoadingVisualization &&
          !displayError && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="mb-4 text-muted-foreground">
                Generate a visualization for the current query results.
              </p>
              <Button
                onClick={() => handleGenerateVisualization()}
                disabled={
                  !currentQuery.sqlQuery ||
                  currentQuery.results.length === 0 ||
                  isLoadingVisualization
                }
              >
                Generate Visualization
              </Button>
            </div>
          )}

        {displayError && !isLoadingVisualization && (
          <div className="text-destructive p-4 text-center space-y-2">
            <p>Error: {displayError}</p>
            <Button
              onClick={() => handleGenerateVisualization()}
              disabled={
                !currentQuery.sqlQuery ||
                currentQuery.results.length === 0 ||
                isLoadingVisualization
              }
              variant="outline"
            >
              Retry Generation
            </Button>
          </div>
        )}

        {currentQuery.jsVisualizationCode &&
          !displayError &&
          !isLoadingVisualization && (
            <div className="space-y-2 flex-grow flex flex-col">
              <Button
                onClick={() => {
                  setAdditionalPrompt("");
                  setIsRegenerateDialogOpen(true);
                }}
                variant="outline"
                size="sm"
                className="mb-2 self-start"
              >
                Regenerate Visualization
              </Button>
              <div className="flex-grow">
                <Chart />
              </div>
            </div>
          )}
      </div>
      {/* Loading Overlay */}
      {isLoadingVisualization && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-primary mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg font-semibold text-foreground">
              Generating visualization...
            </p>
          </div>
        </div>
      )}
      {/* Regenerate Visualization Dialog (uses portal, so not affected by overlay) */}
      <Dialog
        open={isRegenerateDialogOpen}
        onOpenChange={setIsRegenerateDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Refine Visualization</DialogTitle>
            <DialogDescription>
              Optionally add more details or instructions to refine the
              visualization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="additionalPrompt"
              placeholder="Leave blank to skip"
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRegenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => {
                const finalQuery = additionalPrompt.trim()
                  ? promptedVisualization(
                      currentQuery.naturalLanguageQuery,
                      additionalPrompt.trim()
                    )
                  : currentQuery.naturalLanguageQuery;
                handleGenerateVisualization(finalQuery);
                setIsRegenerateDialogOpen(false);
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
