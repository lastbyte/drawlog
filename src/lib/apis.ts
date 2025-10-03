// Browser-based storage API client for boards and rich text data
// Provides SQL-like interface for localStorage operations

export interface Board {
  id: string;
  name: string;
  richtext: string;
  excalidraw_content: string;
  created_at: string;
  updated_at: string;
}

export interface BoardCreateInput {
  name: string;
  richtext?: string;
  excalidraw_content?: string;
}

export interface BoardUpdateInput {
  name?: string;
  richtext?: string;
  excalidraw_content?: string;
}

export interface QueryOptions {
  where?: Partial<Board>;
  orderBy?: keyof Board;
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

class BoardStorageAPI {
  private readonly STORAGE_KEY = "drawlog_boards";

  // Private helper methods
  private generateId(): string {
    return `${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private getAllBoards(): Board[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  private saveAllBoards(boards: Board[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(boards));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      throw new Error("Failed to save boards to storage");
    }
  }

  private matchesFilter(board: Board, filter: Partial<Board>): boolean {
    return Object.entries(filter).every(([key, value]) => {
      const boardValue = board[key as keyof Board];
      if (typeof value === "string" && typeof boardValue === "string") {
        return boardValue.toLowerCase().includes(value.toLowerCase());
      }
      return boardValue === value;
    });
  }

  private sortBoards(
    boards: Board[],
    orderBy?: keyof Board,
    order: "asc" | "desc" = "desc"
  ): Board[] {
    if (!orderBy) return boards;

    return boards.sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Public API methods

  /**
   * Create a new board
   */
  async create(input: BoardCreateInput): Promise<Board> {
    const timestamp = this.getCurrentTimestamp();
    const board: Board = {
      id: this.generateId(),
      name: input.name,
      richtext: input.richtext || "",
      excalidraw_content:
        input.excalidraw_content ||
        '{"elements": [], "appState": {}}',
      created_at: timestamp,
      updated_at: timestamp,
    };

    const boards = this.getAllBoards();
    boards.push(board);
    this.saveAllBoards(boards);

    return board;
  }

  /**
   * Find a board by ID
   */
  async findById(id: string): Promise<Board | null> {
    const boards = this.getAllBoards();
    return boards.find((board) => board.id === id) || null;
  }

  /**
   * Find multiple boards with SQL-like query options
   */
  async findMany(options: QueryOptions = {}): Promise<Board[]> {
    let boards = this.getAllBoards();

    // Apply WHERE filter
    if (options.where) {
      boards = boards.filter((board) =>
        this.matchesFilter(board, options.where!)
      );
    }

    // Apply ORDER BY
    if (options.orderBy) {
      boards = this.sortBoards(boards, options.orderBy, options.order);
    }

    // Apply OFFSET
    if (options.offset) {
      boards = boards.slice(options.offset);
    }

    // Apply LIMIT
    if (options.limit) {
      boards = boards.slice(0, options.limit);
    }

    return boards;
  }

  /**
   * Find all boards
   */
  async findAll(): Promise<Board[]> {
    return this.findMany({ orderBy: "updated_at", order: "desc" });
  }

  /**
   * Update a board by ID
   */
  async updateById(id: string, input: BoardUpdateInput): Promise<Board | null> {
    const boards = this.getAllBoards();
    const index = boards.findIndex((board) => board.id === id);

    if (index === -1) {
      return null;
    }

    const updatedBoard: Board = {
      ...boards[index],
      ...input,
      updated_at: this.getCurrentTimestamp(),
    };

    boards[index] = updatedBoard;
    this.saveAllBoards(boards);

    return updatedBoard;
  }

  /**
   * Delete a board by ID
   */
  async deleteById(id: string): Promise<boolean> {
    const boards = this.getAllBoards();
    const index = boards.findIndex((board) => board.id === id);

    if (index === -1) {
      return false;
    }

    boards.splice(index, 1);
    this.saveAllBoards(boards);

    return true;
  }

  /**
   * Search boards by name or content
   */
  async search(query: string): Promise<Board[]> {
    const boards = this.getAllBoards();
    const searchTerm = query.toLowerCase();

    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(searchTerm) ||
        board.richtext.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Count total boards
   */
  async count(options: Pick<QueryOptions, "where"> = {}): Promise<number> {
    let boards = this.getAllBoards();

    if (options.where) {
      boards = boards.filter((board) =>
        this.matchesFilter(board, options.where!)
      );
    }

    return boards.length;
  }

  /**
   * Check if a board exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const board = await this.findById(id);
    return board !== null;
  }

  /**
   * Duplicate a board
   */
  async duplicate(id: string, newName?: string): Promise<Board | null> {
    const originalBoard = await this.findById(id);
    if (!originalBoard) {
      return null;
    }

    const duplicatedBoard = await this.create({
      name: newName || `Copy of ${originalBoard.name}`,
      richtext: originalBoard.richtext,
      excalidraw_content: originalBoard.excalidraw_content,
    });

    return duplicatedBoard;
  }

  /**
   * Clear all boards (use with caution)
   */
  async clear(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export all boards as JSON
   */
  async export(): Promise<string> {
    const boards = this.getAllBoards();
    return JSON.stringify(boards, null, 2);
  }

  /**
   * Import boards from JSON
   */
  async import(
    jsonData: string,
    options: { merge?: boolean } = {}
  ): Promise<void> {
    try {
      const importedBoards: Board[] = JSON.parse(jsonData);

      if (options.merge) {
        const existingBoards = this.getAllBoards();
        const mergedBoards = [...existingBoards];

        importedBoards.forEach((importedBoard) => {
          const existingIndex = mergedBoards.findIndex(
            (b) => b.id === importedBoard.id
          );
          if (existingIndex !== -1) {
            mergedBoards[existingIndex] = importedBoard;
          } else {
            mergedBoards.push(importedBoard);
          }
        });

        this.saveAllBoards(mergedBoards);
      } else {
        this.saveAllBoards(importedBoards);
      }
    } catch (error) {
      throw new Error("Invalid JSON data for import");
    }
  }
}

// Create and export singleton instance
export const boardAPI = new BoardStorageAPI();

// Helper functions for common operations

/**
 * Create a new board with default values
 */
export async function createBoard({ name }: { name: string }): Promise<Board> {
  return boardAPI.create({ name });
}

/**
 * Get a board by ID
 */
export async function getBoard(id: string): Promise<Board | null> {
  return boardAPI.findById(id);
}

export async function updateBoardName(
  id: string,
  name: string
): Promise<Board | null> {
  return boardAPI.updateById(id, { name });
}

/**
 * Update board content (richtext or excalidraw_content)
 */
export async function updateBoardContent(
  id: string,
  content: { richtext?: string; excalidraw_content?: string }
): Promise<Board | null> {
  return boardAPI.updateById(id, content);
}

/**
 * Get all boards sorted by last updated
 */
export async function getAllBoards(): Promise<Board[]> {
  return boardAPI.findAll();
}

/**
 * Search boards
 */
export async function searchBoards(query: string): Promise<Board[]> {
  return boardAPI.search(query);
}

/**
 * Delete a board
 */
export async function deleteBoard(id: string): Promise<boolean> {
  return boardAPI.deleteById(id);
}

/**
 * Get recent boards (last 10)
 */
export async function getRecentBoards(limit: number = 10): Promise<Board[]> {
  return boardAPI.findMany({
    orderBy: "updated_at",
    order: "desc",
    limit,
  });
}
