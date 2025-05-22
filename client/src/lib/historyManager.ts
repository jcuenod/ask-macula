import { type DataRow } from "../services/apiService"; // Assuming DataRow is exported from apiService

export interface HistoryEntry {
  id: string; // Unique ID for the entry
  naturalLanguageQuery: string;
  sqlQuery: string;
  results: DataRow[];
  timestamp: number; // Unix timestamp (ms)
  jsVisualizationCode?: string; // Optional: JS code for visualization
}

const QUERY_HISTORY_KEY = "queryHistory";
const MAX_HISTORY_ITEMS = 50; // Optional: Limit the number of history items

/**
 * Retrieves all history entries from local storage.
 * @returns An array of HistoryEntry objects, or an empty array if none found or error.
 */
export function getItems(): HistoryEntry[] {
  try {
    const storedHistory = localStorage.getItem(QUERY_HISTORY_KEY);
    if (storedHistory) {
      const entries = JSON.parse(storedHistory) as HistoryEntry[];
      // Ensure it's an array, could be old/corrupted data
      return Array.isArray(entries) ? entries : [];
    }
  } catch (error) {
    console.error("Error retrieving query history from local storage:", error);
  }
  return [];
}

/**
 * Adds a new entry to the query history in local storage.
 * Newest entries are added to the beginning of the array.
 * @param entry The HistoryEntry object to add.
 */
export function addItem(entry: HistoryEntry): void {
  try {
    const currentHistory = getItems();
    const updatedHistory = [entry, ...currentHistory];

    // Optional: Limit the number of stored items
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
      updatedHistory.splice(MAX_HISTORY_ITEMS); // Remove oldest items
    }

    localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving query history to local storage:", error);
    // Potentially notify the user if storage is full or disabled
  }
}

/**
 * Clears all query history from local storage.
 */
export function clearHistory(): void {
  try {
    localStorage.removeItem(QUERY_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing query history from local storage:", error);
  }
}

/**
 * Updates a specific history entry's visualization code in local storage.
 * @param entryId The ID of the history entry to update.
 * @param jsVisualizationCode The JavaScript code for visualization.
 */
export function updateItemVisualization(
  entryId: string,
  jsVisualizationCode: string
): void {
  try {
    const currentHistory = getItems();
    const entryIndex = currentHistory.findIndex(
      (entry) => entry.id === entryId
    );

    if (entryIndex !== -1) {
      currentHistory[entryIndex].jsVisualizationCode = jsVisualizationCode;
      localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(currentHistory));
    } else {
      console.warn(`History entry with ID ${entryId} not found for update.`);
    }
  } catch (error) {
    console.error(
      "Error updating history entry visualization in local storage:",
      error
    );
  }
}

/**
 * Deletes a specific history entry from local storage.
 * @param entryId The ID of the history entry to delete.
 */
export function deleteItem(entryId: string): void {
  try {
    const currentHistory = getItems();
    const updatedHistory = currentHistory.filter(
      (entry) => entry.id !== entryId
    );

    if (updatedHistory.length < currentHistory.length) {
      localStorage.setItem(QUERY_HISTORY_KEY, JSON.stringify(updatedHistory));
    } else {
      console.warn(`History entry with ID ${entryId} not found for deletion.`);
    }
  } catch (error) {
    console.error("Error deleting history entry from local storage:", error);
  }
}
