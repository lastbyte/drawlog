import BoardComponent from "@/components/board";
import { RichtextEditor } from "@/components/richtext-editor";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WhiteboardHeading from "@/components/whiteboard-heading";
import { useQueryParam } from "@/hooks/use-queryparams";
import {
  createBoard,
  getBoard,
  updateBoardContent,
  updateBoardName,
  type Board,
} from "@/lib/apis";
import { useAppDispatch, useAppSelector, type RootState } from "@/store";
import {
  setBoardSplitterPosition,
  setBreadCrumbs,
} from "@/store/slices/appSlice";
import {
  CheckCircle,
  Columns2Icon,
  SquarePenIcon,
  WallpaperIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { useNavigate } from "react-router-dom";

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Whiteboard Component with State-Controlled Resizable Split
 *
 * This component demonstrates how to control resizable panels using state:
 *
 * 1. Split percentage is stored in Redux (boardSplitterPosition)
 * 2. Use setSplitPercentage(percentage) to programmatically set split
 * 3. Use showEditor(percentage) to show editor with specific split
 * 4. Use hideEditor() to hide the editor completely
 * 5. The key prop forces re-render when state changes are needed
 *
 * Example usage:
 * - Click the percentage buttons (25%, 40%, 50%, 60%) to see state control
 * - The split position persists in Redux state
 * - Toggle visibility while maintaining split preference
 */
export default function Whiteboard() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const dispatch = useAppDispatch();
  const [board, setBoard] = useState<Board>();

  const [notes, setNotes] = useState<string>("");
  const [whiteboardData, setWhiteboardData] = useState<string>("");

  const queryParams = useQueryParam();
  const boardCreatedRef = useRef(false);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Refs for imperative panel control
  const editorPanelRef = useRef<ImperativePanelHandle>(null);
  const whiteboardPanelRef = useRef<ImperativePanelHandle>(null);

  const { boardSplitterPosition } = useAppSelector(
    (state: RootState) => state.app
  );

  // Default split position when editor is visible
  const DEFAULT_EDITOR_SIZE = 40;

  // Key to force re-render when we need to reset panel sizes
  const [panelKey, setPanelKey] = useState(0);

  useEffect(() => {
    dispatch(
      setBreadCrumbs([
        { title: "home", location: "/" },
        { title: "Whiteboard", location: "/whiteboard" },
      ])
    );
  }, [dispatch]);

  const saveToLocalStorage = useCallback(() => {
    if (!board) return;
    setSaveStatus("saving");
    updateBoardContent(board.id, {
      richtext: notes,
      excalidraw_content: whiteboardData,
    })
      .then(() => {
        setLastSaveTime(new Date());
      })
      .catch(() => {})
      .finally(() => {
        setSaveStatus("idle");
      });
  }, [board, notes, whiteboardData]);

  // check is ant of the content has changed
  useEffect(() => {
    if (board == null) return;
    if (
      board.richtext === notes &&
      board.excalidraw_content === whiteboardData
    ) {
      setSaveStatus("saved");
      return;
    }
    setSaveStatus("idle");
  }, [board, notes, whiteboardData]);

  // Manual save function for button click
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (saveStatus === "saving") return;

    // Auto-save after 0.5 seconds of inactivity
    autoSaveTimeoutRef.current = window.setTimeout(() => {
      if (board) {
        saveToLocalStorage();
      }
    }, 500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [notes, whiteboardData, board, saveStatus, saveToLocalStorage]); // Trigger on notes or whiteboard data change

  useEffect(() => {
    if (queryParams.get("id") == null) {
      // Prevent duplicate board creation in React strict mode
      if (boardCreatedRef.current) return;
      boardCreatedRef.current = true;

      // create a new whiteboard
      createBoard({ name: "Untitled Whiteboard" }).then((board) => {
        // update the url with the new board id
        navigate(`/whiteboard?id=${board.id}`, { replace: true });
        setBoard(board);
        // Initialize local state for new board
        setNotes(board.richtext || "");
        setWhiteboardData(board.excalidraw_content || "");
      });
    } else {
      // load the existing whiteboard
      const boardId = queryParams.get("id")!;
      // Fetch the board data from the API or local storage
      getBoard(boardId).then((board) => {
        if (board) {
          setBoard(board);
          // Also populate the local state with the board data
          setNotes(board.richtext || "");
          setWhiteboardData(board.excalidraw_content || "");
        }
      });
    }
  }, [queryParams, navigate]);

  function handleOnSave() {
    saveToLocalStorage();
  }

  function handleUpdateBoardName(name: string) {
    if (board) {
      updateBoardName(board.id, name).then(() => {
        setBoard((prev) => (prev ? { ...prev, name: name } : prev));
      });
    }
  }

  // Utility functions for programmatic control
  /**
   * Sets the split percentage between editor and whiteboard
   * @param percentage - The percentage of space for the editor (20-80%)
   */
  const setSplitPercentage = useCallback(
    (percentage: number) => {
      dispatch(setBoardSplitterPosition(percentage));

      // Force re-render with new sizes by updating the key
      setPanelKey((prev) => prev + 1);
    },
    [dispatch]
  );

  /**
   * Gets the current split percentage
   * @returns The current percentage of space allocated to the editor
   */
  // const getCurrentSplitPercentage = useCallback(() => {
  //   return boardSplitterPosition ?? DEFAULT_EDITOR_SIZE;
  // }, [boardSplitterPosition]);

  // Calculate current sizes
  const currentEditorSize = boardSplitterPosition ?? DEFAULT_EDITOR_SIZE;
  const currentWhiteboardSize =
    100 - (boardSplitterPosition ?? DEFAULT_EDITOR_SIZE);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Get save button text and icon based on status
  const getSaveButtonProps = () => {
    switch (saveStatus) {
      case "saving":
        return { text: "Saving...", disabled: true };
      case "saved":
        return { text: "Saved", disabled: false };
      case "error":
        return { text: "Save Failed", disabled: false };
      default:
        return { text: "Save", disabled: false };
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="mb-2 flex items-center justify-between px-2">
        <WhiteboardHeading
          name={board?.name || "Loading..."}
          handleUpdateBoardName={handleUpdateBoardName}
        />
        <div className="flex gap-2 items-center">
          {/* Split Control Buttons */}
          {
            <div className="flex gap-1 mr-2 items-center">
              <span className="text-xs text-gray-600 mr-1">Layout </span>
              <Button
                onClick={() => setSplitPercentage(0)}
                variant="ghost"
                size="sm"
                className="text-xs px-2 cursor-pointer"
              >
                <WallpaperIcon /> Board Only
              </Button>
              <Button
                onClick={() => setSplitPercentage(100)}
                variant="ghost"
                size="sm"
                className="text-xs px-2 cursor-pointer"
              >
                <SquarePenIcon /> Text Only
              </Button>
              <Button
                onClick={() => setSplitPercentage(boardSplitterPosition ?? 50)}
                variant="ghost"
                size="sm"
                className="text-xs px-2 cursor-pointer"
              >
                <Columns2Icon />
                Both
              </Button>
            </div>
          }

          {lastSaveTime && saveStatus !== "saving" && (
            <div className="text-xs text-gray-500 mr-2">
              Last saved: {lastSaveTime.toLocaleTimeString()}
            </div>
          )}
          <Button
            onClick={handleOnSave}
            variant={saveStatus === "error" ? "destructive" : "default"}
            size="sm"
            className="w-32 flex items-center gap-2 cursor-pointer"
            disabled={getSaveButtonProps().disabled}
          >
            {saveStatus === "saving" && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saveStatus === "saved" && <CheckCircle className="w-4 h-4" />}
            <span>{getSaveButtonProps().text}</span>
          </Button>
        </div>
      </div>
      <ResizablePanelGroup
        key={panelKey}
        direction="horizontal"
        className="w-full flex-1 rounded-lg"
      >
        <ResizablePanel
          ref={editorPanelRef}
          defaultSize={currentEditorSize}
          minSize={0}
          onResize={(size) => {
            // Only update state if the size actually changed to avoid infinite loops
            dispatch(setBoardSplitterPosition(size));
          }}
          collapsible={false}
        >
          <div className="flex h-full flex-col pr-2">
            <div className="flex-1">
              <RichtextEditor
                initialValue={board?.richtext || ""}
                onChange={setNotes}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="border-2 bg-none hover:border-gray-400"
        />
        <ResizablePanel
          ref={whiteboardPanelRef}
          defaultSize={currentWhiteboardSize}
          minSize={0}
          collapsible={false}
        >
          <div
            className="flex h-full flex-col px-2"
            style={{ minHeight: "400px" }}
          >
            <div
              className="flex-1"
              style={{ minWidth: "400px", minHeight: "400px" }}
            >
              <BoardComponent
                initialData={board?.excalidraw_content || undefined}
                onChange={(data) => setWhiteboardData(data)}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// Export utility functions for external control (if needed)
export type WhiteboardSplitControl = {
  setSplitPercentage: (percentage: number) => void;
  showEditor: (percentage?: number) => void;
  hideEditor: () => void;
  getCurrentSplitPercentage: () => number;
};
