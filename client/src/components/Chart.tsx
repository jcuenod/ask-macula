import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ErrorBoundary } from "./ErrorBoundary";
import { useHistory } from "../contexts/HistoryContext";

export const Chart = () => {
  const [echartsObject, setEchartsObject] = useState<any>(null);
  const { currentQuery } = useHistory();
  const {
    jsVisualizationCode: code,
    results,
    naturalLanguageQuery: query,
  } = currentQuery || {
    jsVisualizationCode: "",
    results: [],
  };

  useEffect(() => {
    // resetBoundary();
    try {
      const f = new Function("results", code || "");
      const options = f(results);
      console.log("ECharts options:", options);
      setEchartsObject(options);
    } catch (error) {
      console.error("Error evaluating code:", error);
    }
  }, [code, results]);

  if (!echartsObject) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border rounded-md">
        <p className="text-muted-foreground">No visualization available.</p>
        <Button variant={"link"} className="ml-2">
          Generate Visualization
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center border rounded-md min-h-48">
      <ErrorBoundary
        fallback={
          <p className="text-destructive p-4 text-center">
            Error: Failed to render chart. You should probably regenerate it.
          </p>
        }
        refreshKey={JSON.stringify([code, query])}
      >
        <ReactECharts
          option={echartsObject}
          notMerge={true}
          style={{ height: "70vh", width: "100%" }}
          className="rounded-md"
        />
      </ErrorBoundary>
    </div>
  );
};
