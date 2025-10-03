import { Excalidraw } from "@excalidraw/excalidraw";

interface BoardProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

export default function Board({ initialData, onChange }: BoardProps) {
  const handleExcalidrawChange = (elements: any, appState: any) => {
    if (onChange) {
      try {
        const serializedData = JSON.stringify({
          elements,
          appState,
        });
        onChange(serializedData);
      } catch (error) {
        console.error("Error saving excalidraw data:", error);
      }
    }
  };

  // Parse initial data for Excalidraw
  let initialElements = [];
  let initialAppState = {};
  
  if (initialData && initialData !== '""' && initialData !== "") {
    try {
      const parsedData = JSON.parse(initialData);
      initialElements = parsedData.elements || [];
      initialAppState = parsedData.appState || {};
    } catch (error) {
      console.error("Error loading excalidraw data:", error);
    }
  }

  return (
    <div className="flex h-full w-full flex-col relative">
      <div className="flex h-full w-full flex-1">
        <Excalidraw
          initialData={{
            elements: initialElements,
            appState: initialAppState,
          }}
          onChange={handleExcalidrawChange}
          UIOptions={{
            canvasActions: {
              loadScene: false,
            },
          }}
        />
      </div>
    </div>
  );
}
