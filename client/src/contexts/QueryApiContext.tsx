import React, {
  createContext,
  useState,
  useContext,
  type ReactNode,
} from "react";
import {
  submitNaturalLanguageQuery,
  type QueryServiceResponse,
} from "../services/apiService";

interface UseQueryApiState {
  data: QueryServiceResponse | null;
  isLoading: boolean;
  error: string | null;
}

type QueryApiContextType = [
  (naturalLanguageQuery: string) => Promise<QueryServiceResponse | null>,
  UseQueryApiState,
  () => void
];

const QueryApiContext = createContext<QueryApiContextType | undefined>(
  undefined
);

export const QueryApiProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [state, setState] = useState<UseQueryApiState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const executeQuery = async (naturalLanguageQuery: string) => {
    if (!naturalLanguageQuery.trim()) {
      // Or handle this validation upstream
      return null;
    }
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await submitNaturalLanguageQuery(naturalLanguageQuery);
      setState({ data: response, isLoading: false, error: null });
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setState({ data: null, isLoading: false, error: errorMessage });
      return null;
    }
  };

  const clearError = () => {
    setState((prevState) => ({ ...prevState, error: null }));
  };

  return (
    <QueryApiContext.Provider value={[executeQuery, state, clearError]}>
      {children}
    </QueryApiContext.Provider>
  );
};

export const useQueryApi = (): QueryApiContextType => {
  const context = useContext(QueryApiContext);
  if (context === undefined) {
    throw new Error("useSharedQueryApi must be used within a QueryApiProvider");
  }
  return context;
};
