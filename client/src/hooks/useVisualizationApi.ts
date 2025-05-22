import { useState } from "react";
import {
  fetchVisualizationCode,
  type VisualizeServiceResponse,
} from "../services/apiService";

interface UseVisualizationApiState {
  jsCode: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useVisualizationApi(): [
  (
    userQuery: string,
    sqlQuery: string
  ) => Promise<VisualizeServiceResponse | null>,
  UseVisualizationApiState,
  () => void
] {
  const [state, setState] = useState<UseVisualizationApiState>({
    jsCode: null,
    isLoading: false,
    error: null,
  });

  const clearError = () => {
    setState((prevState) => ({ ...prevState, error: null }));
  };

  const generateVisualization = async (userQuery: string, sqlQuery: string) => {
    setState({ jsCode: null, isLoading: true, error: null });
    try {
      const response = await fetchVisualizationCode(userQuery, sqlQuery);
      setState({ jsCode: response.js_code, isLoading: false, error: null });
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setState({ jsCode: null, isLoading: false, error: errorMessage });
      return null;
    }
  };

  return [generateVisualization, state, clearError];
}
