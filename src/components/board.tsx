import { Tldraw, type TLUiEventData, type TLUiEventMap } from "tldraw";
import "tldraw/tldraw.css";
import { useEffect, useRef } from "react";

interface BoardProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

export default function Board({ initialData, onChange }: BoardProps) {
  const editorRef = useRef<any>(null);
  const hasLoadedInitialData = useRef(false);

  // Set up auto-save functionality
  useEffect(() => {
    if (!onChange || !editorRef.current) return;

    const handleChange = () => {
      try {
        const snapshot = editorRef.current.store.getStoreSnapshot();
        const serializedData = JSON.stringify(snapshot);
        onChange(serializedData);
      } catch (error) {
        console.error("Error saving tldraw data:", error);
      }
    };

    // Save immediately on every change
    const unsubscribe = editorRef.current.store.listen(handleChange);

    return () => {
      unsubscribe();
    };
  }, [onChange]);

  const handleMount = (editor: any) => {
    editorRef.current = editor;

    // Load initial data when editor mounts
    if (
      initialData &&
      !hasLoadedInitialData.current &&
      initialData !== '""' &&
      initialData !== ""
    ) {
      try {
        const parsedData = JSON.parse(initialData);
        editor.store.loadStoreSnapshot(parsedData);
        hasLoadedInitialData.current = true;
      } catch (error) {
        console.error("Error loading tldraw data:", error);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col relative">
      <div className="flex h-full w-full flex-1">
        <Tldraw
          onMount={handleMount}
          // Hide the default UI components that show license info
          components={{
            HelperButtons: null,
            SharePanel: null,
          }}
        />
      </div>
    </div>
  );
}
