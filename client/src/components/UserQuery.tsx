import { Input } from "./ui/input";
import { useState, useEffect, type KeyboardEvent } from "react";
import { useQueryApi } from "../contexts/QueryApiContext";
import { useHistory } from "../contexts/HistoryContext";

export const UserQuery = () => {
  const { currentQuery, addQuery } = useHistory();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState(
    currentQuery?.naturalLanguageQuery || ""
  );
  const [executeQuery, { isLoading }] = useQueryApi();

  useEffect(() => {
    if (currentQuery) {
      setNaturalLanguageInput(currentQuery.naturalLanguageQuery);
    }
  }, [currentQuery]);

  const handleQuerySubmit = async () => {
    if (!naturalLanguageInput.trim()) return;
    const response = await executeQuery(naturalLanguageInput);

    if (response) {
      addQuery({
        naturalLanguageQuery: naturalLanguageInput,
        sqlQuery: response.sql_query,
        results: response.results,
      });
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleQuerySubmit();
    }
  };

  return (
    <div className="mb-6">
      <Input
        type="text"
        placeholder="Enter your natural language query and press Enter..."
        className="w-full text-xl p-6 h-16 shadow-sm"
        value={naturalLanguageInput}
        onChange={(e) => setNaturalLanguageInput(e.target.value)}
        onKeyDown={handleInputKeyDown}
        disabled={isLoading}
      />
    </div>
  );
};
