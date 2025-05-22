import ReactECharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import type { DataRow } from "../services/apiService";

export const Visualization = ({
  code,
  results,
}: {
  code: string;
  results: DataRow[];
}) => {
  const [echartsObject, setEchartsObject] = useState<any>(null);

  useEffect(() => {
    try {
      const f = new Function("results", code);
      const options = f(results);
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
    <div className="flex items-center justify-center border rounded-md">
      <ReactECharts
        option={echartsObject}
        notMerge={true}
        style={{ height: "70vh", width: "100%" }}
        className="rounded-md"
      />
    </div>
  );
};
