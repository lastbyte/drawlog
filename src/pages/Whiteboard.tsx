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
import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Whiteboard() {
  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const dispatch = useAppDispatch();
  const [board, setBoard] = useState<Board>();

  const queryParams = useQueryParam();
  const boardCreatedRef = useRef(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

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
  }, []);

  function saveBoard() {
    if (board) {
      updateBoardContent(board.id, {
        richtext: board.richtext,
        tldraw_content: board.tldraw_content,
      })
        .then(() => {
          console.log("Board saved successfully");
        })
        .catch((error) => {
          console.error("Error saving board:", error);
        });
    }
  }

  // Immediate save function with queue to prevent concurrent saves
  const immediateSave = useCallback(
    async (
      boardId: string,
      updates: { richtext?: string; tldraw_content?: string }
    ) => {
      // Queue the save operation to prevent concurrent saves
      saveQueueRef.current = saveQueueRef.current.then(async () => {
        try {
          await updateBoardContent(boardId, updates);
          console.log("Board saved successfully");
        } catch (error) {
          console.error("Error saving board:", error);
          // Could implement retry logic here
        }
      });
    },
    []
  );

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
  }, []);

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
      immediateSave(board.id, { tldraw_content: data });
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
      immediateSave(board.id, { richtext: value });
    }
  };

  const handleSaveBoard = () => {
    saveBoard();
  };

  const toggleEditor = () => {
    setIsEditorVisible(!isEditorVisible);
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="mb-2 flex items-center justify-between px-2">
        <WhiteboardHeading board={board} />
        <div className="flex gap-2 items-end">
          <Button
            onClick={toggleEditor}
            variant="outline"
            size="sm"
            className="w-30"
          >
            {isEditorVisible ? (
              <>
                <SidebarCloseIcon /> Hide Notes
              </>
            ) : (
              <>
                <SidebarOpenIcon /> Show Notes
              </>
            )}
          </Button>
          <Button
            onClick={handleSaveBoard}
            variant="default"
            size="sm"
            className="w-25"
          >
            {isEditorVisible ? "save" : "saving"}
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
