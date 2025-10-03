import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { Component, type ReactNode } from "react";

interface BoardProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

// Error Boundary for Excalidraw
class ExcalidrawErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Excalidraw error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Canvas Error
            </h3>
            <p className="text-gray-600 mb-4">
              The drawing canvas encountered an error. Click below to reset.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reset Canvas
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Board({ initialData, onChange }: BoardProps) {
  const handleExcalidrawChange = (elements: any, appState: any) => {
    if (onChange) {
      try {
        // Sanitize appState before saving to prevent future canvas issues
        const sanitizedAppState = { ...appState };

        // Ensure collaborators is serializable (convert Map to array if needed)
        if (sanitizedAppState.collaborators instanceof Map) {
          sanitizedAppState.collaborators = Array.from(
            sanitizedAppState.collaborators.entries()
          );
        } else if (!Array.isArray(sanitizedAppState.collaborators)) {
          sanitizedAppState.collaborators = [];
        }

        // Remove problematic properties that can cause canvas size issues
        delete sanitizedAppState.width;
        delete sanitizedAppState.height;

        // Ensure zoom is within bounds
        if (sanitizedAppState.zoom?.value) {
          sanitizedAppState.zoom.value = Math.max(
            0.1,
            Math.min(5, sanitizedAppState.zoom.value)
          );
        }

        // Ensure scroll values are within bounds
        if (typeof sanitizedAppState.scrollX === "number") {
          sanitizedAppState.scrollX = Math.max(
            -10000,
            Math.min(10000, sanitizedAppState.scrollX)
          );
        }
        if (typeof sanitizedAppState.scrollY === "number") {
          sanitizedAppState.scrollY = Math.max(
            -10000,
            Math.min(10000, sanitizedAppState.scrollY)
          );
        }

        const serializedData = JSON.stringify({
          elements,
          appState: sanitizedAppState,
        });
        onChange(serializedData);
      } catch (error) {
        console.error("Error saving excalidraw data:", error);
      }
    }
  };

  // Parse and sanitize initial data
  let parsedInitialData = undefined;

  if (initialData && initialData !== '""' && initialData !== "") {
    try {
      const data = JSON.parse(initialData);

      // Sanitize the appState to prevent errors
      const sanitizedAppState = data.appState ? { ...data.appState } : {};

      // Ensure collaborators is always an array or Map
      if (
        !Array.isArray(sanitizedAppState.collaborators) &&
        !(sanitizedAppState.collaborators instanceof Map)
      ) {
        sanitizedAppState.collaborators = [];
      }

      // Ensure other array/object properties exist
      if (
        !sanitizedAppState.selectedElementIds ||
        !Array.isArray(sanitizedAppState.selectedElementIds)
      ) {
        sanitizedAppState.selectedElementIds = [];
      }
      if (
        !sanitizedAppState.selectedGroupIds ||
        !Array.isArray(sanitizedAppState.selectedGroupIds)
      ) {
        sanitizedAppState.selectedGroupIds = [];
      }

      // Remove problematic canvas sizing properties
      delete sanitizedAppState.width;
      delete sanitizedAppState.height;

      // Ensure zoom is within safe bounds
      if (sanitizedAppState.zoom?.value) {
        sanitizedAppState.zoom.value = Math.max(
          0.1,
          Math.min(5, sanitizedAppState.zoom.value)
        );
      } else {
        sanitizedAppState.zoom = { value: 1 as any };
      }

      // Ensure scroll values are within bounds
      if (typeof sanitizedAppState.scrollX === "number") {
        sanitizedAppState.scrollX = Math.max(
          -10000,
          Math.min(10000, sanitizedAppState.scrollX)
        );
      } else {
        sanitizedAppState.scrollX = 0;
      }
      if (typeof sanitizedAppState.scrollY === "number") {
        sanitizedAppState.scrollY = Math.max(
          -10000,
          Math.min(10000, sanitizedAppState.scrollY)
        );
      } else {
        sanitizedAppState.scrollY = 0;
      }

      parsedInitialData = {
        elements: data.elements || [],
        appState: sanitizedAppState,
      };
    } catch (error) {
      console.error("Error parsing initial data:", error);
      parsedInitialData = undefined;
    }
  }

  return (
    <div className="flex h-full w-full flex-col relative overflow-hidden">
      <div
        className="flex h-full w-full flex-1 overflow-hidden"
        style={{
          minHeight: "400px",
          minWidth: "400px",
          maxHeight: "calc(100vh - 100px)", // Leave some margin for UI
          maxWidth: "calc(100vw - 100px)", // Leave some margin for UI
          height: "100%",
          width: "100%",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>
          <ExcalidrawErrorBoundary>
            <Excalidraw
              initialData={parsedInitialData}
              isCollaborating={false}
              onChange={handleExcalidrawChange}
            />
          </ExcalidrawErrorBoundary>
        </div>
      </div>
    </div>
  );
}
