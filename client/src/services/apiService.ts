const API_BASE_URL = "/api";

// Define the structure for individual data rows in the results
export interface DataRow {
  [key: string]: string | number | boolean | null; // Allowing for various simple data types
}

// Define the structure for the /api/query response
export interface QueryServiceResponse {
  sql_query: string;
  results: DataRow[];
}

// Define the structure for the /api/visualize response
export interface VisualizeServiceResponse {
  js_code: string;
}

/**
 * Submits a natural language query to the backend.
 * @param naturalLanguageQuery The natural language query string.
 * @returns A promise that resolves to the SQL query and its results.
 */
export async function submitNaturalLanguageQuery(
  naturalLanguageQuery: string
): Promise<QueryServiceResponse> {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: naturalLanguageQuery }), // Assuming the backend expects { query: "..." }
  });

  if (!response.ok) {
    // You might want to handle errors more gracefully, e.g., by parsing error messages from the response
    const errorData = await response.text();
    throw new Error(
      `API request to /query failed with status ${response.status}: ${errorData}`
    );
  }

  return response.json() as Promise<QueryServiceResponse>;
}

/**
 * Fetches JavaScript code for visualization based on an SQL query and its results.
 * @param sqlQuery The SQL query string.
 * @param results The results obtained from executing the SQL query.
 * @returns A promise that resolves to the JavaScript code for visualization.
 */
export async function fetchVisualizationCode(
  userQuery: string,
  sqlQuery: string
): Promise<VisualizeServiceResponse> {
  const response = await fetch(`${API_BASE_URL}/visualize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: userQuery,
      sql_query: sqlQuery,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `API request to /visualize failed with status ${response.status}: ${errorData}`
    );
  }

  return response.json() as Promise<VisualizeServiceResponse>;
}
