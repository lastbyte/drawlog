import { Button } from "@/components/ui/button";
import { deleteBoard } from "@/lib/apis";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  PencilIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import type { Whiteboard } from ".";

export const columns: ColumnDef<Whiteboard>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return <span className="cursor-pointer font-bold">ID</span>;
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "last_updated",
    header: () => <div className="text-center">Last Updated</div>,
    size: 200,

    cell: ({ row }) => {
      const lastUpdated = row.getValue("last_updated") as string;
      return <div className="text-center font-medium">{lastUpdated}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const board = row.original;

      const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
          await deleteBoard(board.id);
          // Refresh the table data by calling the parent component's loadBoards function
          (table.options.meta as any)?.onDeleteBoard();
        } catch (error) {
          console.error("Error deleting board:", error);
        }
      };

      const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        (table.options.meta as any)?.onNavigate(`/whiteboard?id=${board.id}`);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleEdit}>
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(board.id);
              }}
            >
              <StarIcon className="mr-2 h-4 w-4" />
              Add to Favorites
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-500"
              onClick={handleDelete}
            >
              <Trash2Icon size={16} className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
