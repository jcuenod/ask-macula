import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App.tsx";
import { HistoryProvider } from "./contexts/HistoryContext.tsx";
import { QueryApiProvider } from "./contexts/QueryApiContext"; // Import QueryApiProvider

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HistoryProvider>
      <QueryApiProvider>
        <App />
      </QueryApiProvider>
    </HistoryProvider>
  </StrictMode>
);
