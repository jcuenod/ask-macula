import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type HistoryEntry,
  getItems as getHistoryEntriesFromStorage,
  addItem as addHistoryEntryToStorage,
  updateItemVisualization as updateHistoryEntryVisualizationInStorage,
  deleteItem as deleteHistoryEntryFromStorage,
  clearHistory as clearHistoryStorage,
} from "../lib/historyManager";
import type { DataRow } from "../services/apiService";

interface HistoryContextType {
  queries: HistoryEntry[];
  currentQuery: HistoryEntry | null;
  setQuery: (item: HistoryEntry | null) => void;
  addQuery: (queryData: {
    naturalLanguageQuery: string;
    sqlQuery: string;
    results: DataRow[];
  }) => HistoryEntry;
  updateQueryViz: (itemId: string, jsCode: string) => void;
  deleteQuery: (itemId: string) => void;
  clearQueries: () => void;
  isLoadingQuery: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [queries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [currentQuery, setCurrentQuery] = useState<HistoryEntry | null>(null);
  const [isLoadingQuery, setIsLoadingQuery] = useState<boolean>(true);

  useEffect(() => {
    const loadedEntries = getHistoryEntriesFromStorage();
    setHistoryEntries(loadedEntries);
    // Optional: Set currentHistoryItem to the most recent one or null.
    // For now, it remains null until explicitly selected or a new query is made.
    setIsLoadingQuery(false);
  }, []);

  const addQuery = useCallback(
    (queryData: {
      naturalLanguageQuery: string;
      sqlQuery: string;
      results: DataRow[];
    }): HistoryEntry => {
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        naturalLanguageQuery: queryData.naturalLanguageQuery,
        sqlQuery: queryData.sqlQuery,
        results: queryData.results,
        timestamp: Date.now(),
        jsVisualizationCode: undefined, // Explicitly undefined for new entries
      };
      addHistoryEntryToStorage(newEntry);
      setHistoryEntries((prevEntries) =>
        [newEntry, ...prevEntries].slice(0, 50)
      );
      setCurrentQuery(newEntry); // Automatically select the new entry
      return newEntry;
    },
    []
  );

  const setQuery = useCallback((item: HistoryEntry | null) => {
    setCurrentQuery(item);
  }, []);

  const updateQueryViz = useCallback((itemId: string, jsCode: string) => {
    updateHistoryEntryVisualizationInStorage(itemId, jsCode);
    setHistoryEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === itemId ? { ...entry, jsVisualizationCode: jsCode } : entry
      )
    );
    setCurrentQuery((prevCurrent) =>
      prevCurrent?.id === itemId
        ? { ...prevCurrent, jsVisualizationCode: jsCode }
        : prevCurrent
    );
  }, []);

  const deleteQuery = useCallback((itemId: string) => {
    deleteHistoryEntryFromStorage(itemId);

    setHistoryEntries((prevEntries) => {
      const entryToDeleteIndex = prevEntries.findIndex((e) => e.id === itemId);
      if (entryToDeleteIndex === -1) return prevEntries;

      const updatedEntries = prevEntries.filter((e) => e.id !== itemId);

      setCurrentQuery((prevCurrentItem) => {
        if (prevCurrentItem?.id === itemId) {
          if (updatedEntries.length === 0) {
            return null;
          }
          let newIndex = entryToDeleteIndex;
          if (newIndex >= updatedEntries.length) {
            newIndex = updatedEntries.length - 1;
          }
          return updatedEntries[newIndex] || null;
        }
        return prevCurrentItem;
      });
      return updatedEntries;
    });
  }, []);

  const clearQueries = useCallback(() => {
    clearHistoryStorage();
    setHistoryEntries([]);
    setCurrentQuery(null);
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        queries,
        currentQuery,
        setQuery,
        addQuery,
        updateQueryViz,
        deleteQuery,
        clearQueries,
        isLoadingQuery,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
};
