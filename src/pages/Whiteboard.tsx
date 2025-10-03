import Board from "@/components/board";
import { RichtextEditor } from "@/components/richtext-editor";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WhiteboardHeading from "@/components/whiteboard-heading";
import { useQueryParam } from "@/hooks/use-queryparams";
import { createBoard, getBoard, updateBoardContent } from "@/lib/apis";
import { useAppDispatch, useAppSelector, type RootState } from "@/store";
import {
  setBoardSplitterPosition,
  setBreadCrumbs,
} from "@/store/slices/appSlice";
import {
  SidebarCloseIcon,
  SidebarOpenIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function Whiteboard() {
  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const dispatch = useAppDispatch();
  const [board, setBoard] = useState<Board>();

  const queryParams = useQueryParam();
  const boardCreatedRef = useRef(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const autoSaveTimeoutRef = useRef<number | null>(null);

  const { boardSplitterPosition } = useAppSelector(
    (state: RootState) => state.app
  );

  useEffect(() => {
    dispatch(
      setBreadCrumbs([
        { title: "home", location: "/" },
        { title: "Whiteboard", location: "/whiteboard" },
      ])
    );
  }, [dispatch]);

  // Enhanced save function with status tracking
  const saveToLocalStorage = useCallback(
    async (
      boardId: string,
      updates: { richtext?: string; tldraw_content?: string },
      immediate: boolean = false
    ) => {
      // Clear any pending auto-save if this is an immediate save
      if (immediate && autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      setSaveStatus("saving");

      // Queue the save operation to prevent concurrent saves
      saveQueueRef.current = saveQueueRef.current.then(async () => {
        try {
          const savedBoard = await updateBoardContent(boardId, updates);
          if (savedBoard) {
            setSaveStatus("saved");
            setLastSaveTime(new Date());
            console.log("Board saved successfully to localStorage");

            // Reset status to idle after 2 seconds
            setTimeout(() => {
              setSaveStatus("idle");
            }, 2000);
          } else {
            throw new Error("Failed to save board");
          }
        } catch (error) {
          console.error("Error saving board:", error);
          setSaveStatus("error");

          // Reset error status after 3 seconds
          setTimeout(() => {
            setSaveStatus("idle");
          }, 3000);
        }
      });
    },
    []
  );

  // Debounced auto-save function
  const debouncedSave = useCallback(
    (
      boardId: string,
      updates: { richtext?: string; tldraw_content?: string }
    ) => {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save (1 second delay)
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveToLocalStorage(boardId, updates, false);
      }, 1000);
    },
    [saveToLocalStorage]
  );

  // Manual save function for button click
  function handleManualSave() {
    if (board) {
      saveToLocalStorage(
        board.id,
        {
          richtext: board.richtext,
          tldraw_content: board.tldraw_content,
        },
        true
      );
    }
  }

  useEffect(() => {
    if (queryParams.get("id") == null) {
      // Prevent duplicate board creation in React strict mode
      if (boardCreatedRef.current) return;
      boardCreatedRef.current = true;

      // create a new whiteboard
      createBoard({ name: "Untitled Whiteboard" }).then((board) => {
        // update the url with the new board id
        window.history.replaceState(null, "", `/whiteboard?id=${board.id}`);
        setBoard(board);
      });
    } else {
      // load the existing whiteboard
      const boardId = queryParams.get("id")!;
      // Fetch the board data from the API or local storage
      getBoard(boardId).then((board) => {
        if (board) {
          setBoard(board);
        }
      });
    }
  }, [queryParams]);

  const handleWhiteboardChange = (data: string) => {
    setBoard((prevBoard) =>
      prevBoard
        ? {
            ...prevBoard,
            tldraw_content: data,
          }
        : undefined
    );
    if (board) {
      // Use debounced save for auto-save on changes
      debouncedSave(board.id, { tldraw_content: data });
    }
  };

  const handleNotesChange = (value: string) => {
    setBoard((prevBoard) =>
      prevBoard
        ? {
            ...prevBoard,
            richtext: value,
          }
        : undefined
    );
    if (board) {
      // Use debounced save for auto-save on changes
      debouncedSave(board.id, { richtext: value });
    }
  };

  const handleSaveBoard = () => {
    handleManualSave();
  };

  const toggleEditor = () => {
    setIsEditorVisible(!isEditorVisible);
  };

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
        <WhiteboardHeading board={board} />
        <div className="flex gap-2 items-center">
          {lastSaveTime && saveStatus !== "saving" && (
            <div className="text-xs text-gray-500 mr-2">
              Last saved: {lastSaveTime.toLocaleTimeString()}
            </div>
          )}
          <Button
            onClick={toggleEditor}
            variant="outline"
            size="sm"
            className="w-30"
          >
            {isEditorVisible ? (
              <>
                <SidebarCloseIcon className="w-4 h-4 mr-1" /> Hide Notes
              </>
            ) : (
              <>
                <SidebarOpenIcon className="w-4 h-4 mr-1" /> Show Notes
              </>
            )}
          </Button>
          <Button
            onClick={handleSaveBoard}
            variant={saveStatus === "error" ? "destructive" : "default"}
            size="sm"
            className="w-32 flex items-center gap-2"
            disabled={getSaveButtonProps().disabled}
          >
            {saveStatus === "saving" && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saveStatus === "saved" && <CheckCircle className="w-4 h-4" />}
            {saveStatus === "error" && <AlertCircle className="w-4 h-4" />}
            <span>{getSaveButtonProps().text}</span>
          </Button>
        </div>
      </div>
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full flex-1 rounded-lg"
      >
        <ResizablePanel
          defaultSize={isEditorVisible ? boardSplitterPosition : 0}
          minSize={isEditorVisible ? 30 : 0}
          className={`${!isEditorVisible ? "hidden" : ""}`}
          onResize={(size) => {
            // size is in percentage
            // console.log("Editor panel resized to:", size);
            // update the redux state
            dispatch(setBoardSplitterPosition(size));
          }}
        >
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <RichtextEditor
                initialValue={board?.richtext || ""}
                onChange={handleNotesChange}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={!isEditorVisible ? "hidden" : ""}
        />
        <ResizablePanel
          defaultSize={
            isEditorVisible ? 100 - (boardSplitterPosition ?? 0) : 100
          }
        >
          <div className="flex h-full flex-col p-2">
            <div className="flex-1">
              <Board
                initialData={board?.tldraw_content || undefined}
                onChange={handleWhiteboardChange}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
