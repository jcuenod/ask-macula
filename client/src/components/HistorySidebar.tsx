import { useState } from "react";
import { CollapsibleDivider } from "./CollapsibleDivider";
import { Archive } from "lucide-react";
import { useHistory } from "../contexts/HistoryContext"; // Import useHistory
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

const MIN_SIDEBAR_WIDTH = 180;
const DEFAULT_SIDEBAR_WIDTH = 256;
const MAX_SIDEBAR_WIDTH = 500;

export function HistorySidebar() {
  const { queries, currentQuery, setQuery, deleteQuery } = useHistory();

  const activeHistoryItemId = currentQuery?.id || null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isDragging, setIsDragging] = useState(false);

  const handleToggleClick = () => {
    const newIsSidebarOpen = !isSidebarOpen;
    setIsSidebarOpen(newIsSidebarOpen);
    if (newIsSidebarOpen && sidebarWidth < MIN_SIDEBAR_WIDTH) {
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    }
  };

  const handleDividerDrag = (clientX: number) => {
    setIsDragging(true);
    const newWidth = Math.max(
      MIN_SIDEBAR_WIDTH,
      Math.min(clientX, MAX_SIDEBAR_WIDTH)
    );
    setSidebarWidth(newWidth);
    if (!isSidebarOpen && newWidth > 0) {
      setIsSidebarOpen(true);
    }
  };

  const handleDividerDragEnd = () => {
    setIsDragging(false);
    if (sidebarWidth < MIN_SIDEBAR_WIDTH) {
      setIsSidebarOpen(false);
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    }
  };

  return (
    <>
      <aside
        className={`duration-300 ease-in-out h-screen sticky top-0 overflow-hidden p-0 ${
          isDragging ? "transition-none" : "transition-all"
        }`}
        style={{ width: isSidebarOpen ? `${sidebarWidth}px` : "0px" }}
      >
        <div className="flex justify-between items-center m-4">
          <h2 className="ml-1 text-xl font-semibold">History</h2>
          {/* TODO: Add Clear History Button here, using clearHistory from context */}
        </div>
        {queries.length === 0 ? (
          <p className="px-5 text-sm text-muted-foreground">
            No history available. Start a new query in the main panel.
          </p>
        ) : (
          <div className="h-[calc(100%-4rem)] mb-4 px-4 overflow-y-auto">
            <ul className="space-y-2 mr-2 mb-4">
              {queries.map((entry) => (
                <li
                  key={entry.id}
                  className="relative flex flex-row w-full p-0 items-center rounded group hover:bg-muted"
                >
                  <button
                    onClick={() => setQuery(entry)} // Use prop from AppInternal
                    className={`flex-1 transition-all p-2 min-w-0 overflow-hidden text-left focus:outline-none duration-200 ease-in-out max-w-100 group-hover:max-w-[calc(100%_-_2.5rem)] ${
                      entry.id === activeHistoryItemId ? "font-bold" : ""
                    }`}
                    title={entry.naturalLanguageQuery}
                  >
                    <p className="text-sm truncate">
                      {entry.naturalLanguageQuery}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="absolute top-0 right-0 bottom-0 bg-transparent hover:bg-red-100 w-0 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer group-hover:w-10 transition-all duration-200 ease-in-out text-red-800 hover:text-red-600 active:text-red-400 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                        title="Delete query"
                      >
                        <Archive className="h-5 w-5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                          This action will permanently delete the query: "
                          <span className="font-semibold">
                            {entry.naturalLanguageQuery}
                          </span>
                          ". This cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button data-slot="dialog-close" variant={"outline"}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          variant={"destructive"}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuery(entry.id); // Use from context
                          }}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <CollapsibleDivider
        onToggleClick={handleToggleClick}
        onDrag={handleDividerDrag}
        onDragEnd={handleDividerDragEnd}
      />
    </>
  );
}
