import { EditIcon, SaveIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBoardName, type Board } from "@/lib/apis";

interface WhiteboardHeadingProps {
  board: Board | undefined;
}
export default function WhiteboardHeading({ board }: WhiteboardHeadingProps) {
  const [name, setName] = useState(board?.name || "");
  const [isEditing, setIsEditing] = useState(false);

  if (board == null || board == undefined) return null;

  function onSave() {
    setIsEditing(false);
    if (board) {
      updateBoardName(board.id, name);
    }
  }

  return (
    <div className="flex w-full max-w-50 items-center gap-2">
      {isEditing ? (
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="email"
          placeholder="Email"
        />
      ) : (
        <span>{name}</span>
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
