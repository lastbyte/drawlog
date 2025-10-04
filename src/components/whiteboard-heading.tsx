import { EditIcon, SaveIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WhiteboardHeadingProps {
  name: string;
  handleUpdateBoardName: (name: string) => void;
}
export default function WhiteboardHeading({
  name,
  handleUpdateBoardName,
}: WhiteboardHeadingProps) {
  const [nameInput, setNameInput] = useState(name);
  const [isEditing, setIsEditing] = useState(false);

  // Update nameInput when name prop changes
  useEffect(() => {
    setNameInput(name);
  }, [name]);

  function onSave() {
    setIsEditing(false);
    handleUpdateBoardName(nameInput);
  }

  return (
    <div className="flex w-full max-w-120 items-center gap-2">
      {isEditing ? (
        <Input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSave();
            }
          }}
          type="text"
          placeholder="Name your whiteboard"
        />
      ) : (
        <span>{nameInput}</span>
      )}
      {isEditing ? (
        <Button type="submit" variant="ghost" size="icon" onClick={onSave}>
          <SaveIcon />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
        >
          <EditIcon />
        </Button>
      )}
    </div>
  );
}
