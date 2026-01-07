/**
 * Spreadsheet Types for Tables App
 *
 * These types define the structure for spreadsheet data that can be stored
 * in Firestore and rendered using react-spreadsheet.
 */

// ============ Cell Types ============

/**
 * Cell value types supported in the spreadsheet
 */
export type CellValueType = "text" | "number" | "date" | "boolean" | "formula";

/**
 * Cell format options
 */
export type CellFormat = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textAlign?: "left" | "center" | "right";
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  numberFormat?: "general" | "number" | "currency" | "percent" | "date";
  decimalPlaces?: number;
};

/**
 * Individual cell data
 */
export type SpreadsheetCell = {
  value: string | number | boolean | null;
  formula?: string; // e.g., "=SUM(A1:A10)"
  type?: CellValueType;
  format?: CellFormat;
};

/**
 * Cell matrix - 2D array representing spreadsheet data (for in-memory use)
 * Access as cellData[rowIndex][columnIndex]
 */
export type CellMatrix = (SpreadsheetCell | undefined)[][];

/**
 * Sparse cell map for Firestore storage (avoids nested arrays)
 * Keys are in format "r{row}c{col}" e.g., "r0c0", "r1c5"
 */
export type CellMap = Record<string, SpreadsheetCell>;

// ============ Column Types ============

/**
 * Column data type for type-aware columns
 */
export type ColumnDataType =
  | "text"      // Plain text
  | "number"    // Numeric values
  | "currency"  // Money values
  | "percent"   // Percentage values
  | "date"      // Date values
  | "checkbox"  // Boolean checkbox
  | "select"    // Dropdown selection
  | "link";     // URL/hyperlink

/**
 * Column definition
 */
export type SpreadsheetColumn = {
  id: string;
  name: string;
  width: number; // Width in pixels
  dataType?: ColumnDataType;
  selectOptions?: string[]; // Options for select type columns
  hidden?: boolean;
  frozen?: boolean;
};

// ============ Row Types ============

/**
 * Row definition
 */
export type SpreadsheetRow = {
  id: string;
  height?: number; // Height in pixels, default is 24
  hidden?: boolean;
};

// ============ Selection Types ============

/**
 * Cell reference (e.g., A1, B2)
 */
export type CellRef = {
  row: number;
  col: number;
};

/**
 * Selection range
 */
export type SelectionRange = {
  start: CellRef;
  end: CellRef;
};

// ============ Spreadsheet Data ============

/**
 * Complete spreadsheet data structure stored in Firestore
 * Uses CellMap (sparse) instead of CellMatrix (2D array) for Firestore compatibility
 */
export type SpreadsheetData = {
  cells: CellMap; // Sparse map for Firestore storage
  columns: SpreadsheetColumn[];
  rows: SpreadsheetRow[];
  frozenRows?: number;
  frozenColumns?: number;
  defaultColumnWidth?: number;
  defaultRowHeight?: number;
  rowCount?: number; // Track actual dimensions since cells is sparse
  colCount?: number;
};

/**
 * Default spreadsheet configuration
 */
export const DEFAULT_SPREADSHEET_CONFIG = {
  defaultColumnWidth: 100,
  defaultRowHeight: 24,
  initialRows: 100,
  initialColumns: 26,
  maxRows: 10000,
  maxColumns: 702, // AZ = 26 + 26*26 = 702
};

/**
 * Create empty spreadsheet data with default dimensions
 */
export function createEmptySpreadsheet(
  rows: number = DEFAULT_SPREADSHEET_CONFIG.initialRows,
  columns: number = DEFAULT_SPREADSHEET_CONFIG.initialColumns
): SpreadsheetData {
  // Create column definitions (A, B, C, ... Z, AA, AB, ...)
  const cols: SpreadsheetColumn[] = Array.from({ length: columns }, (_, i) => ({
    id: `col-${i}`,
    name: getColumnLabel(i),
    width: DEFAULT_SPREADSHEET_CONFIG.defaultColumnWidth,
  }));

  // Create row definitions
  const rowDefs: SpreadsheetRow[] = Array.from({ length: rows }, (_, i) => ({
    id: `row-${i}`,
    height: DEFAULT_SPREADSHEET_CONFIG.defaultRowHeight,
  }));

  // Empty cell map (sparse storage for Firestore)
  const cells: CellMap = {};

  return {
    cells,
    columns: cols,
    rows: rowDefs,
    rowCount: rows,
    colCount: columns,
    defaultColumnWidth: DEFAULT_SPREADSHEET_CONFIG.defaultColumnWidth,
    defaultRowHeight: DEFAULT_SPREADSHEET_CONFIG.defaultRowHeight,
  };
}

/**
 * Convert CellMap to CellMatrix for in-memory operations
 */
export function cellMapToMatrix(cellMap: CellMap, rows: number, cols: number): CellMatrix {
  const matrix: CellMatrix = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => undefined)
  );

  for (const [key, cell] of Object.entries(cellMap)) {
    const match = key.match(/^r(\d+)c(\d+)$/);
    if (match) {
      const row = parseInt(match[1], 10);
      const col = parseInt(match[2], 10);
      if (row < rows && col < cols) {
        matrix[row][col] = cell;
      }
    }
  }

  return matrix;
}

/**
 * Convert CellMatrix to CellMap for Firestore storage
 */
export function matrixToCellMap(matrix: CellMatrix): CellMap {
  const cellMap: CellMap = {};

  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell && cell.value !== null && cell.value !== undefined && cell.value !== "") {
        cellMap[`r${rowIndex}c${colIndex}`] = cell;
      }
    });
  });

  return cellMap;
}

/**
 * Convert column index to letter label (0 -> A, 25 -> Z, 26 -> AA, etc.)
 */
export function getColumnLabel(index: number): string {
  let label = "";
  let num = index;

  while (num >= 0) {
    label = String.fromCharCode((num % 26) + 65) + label;
    num = Math.floor(num / 26) - 1;
  }

  return label;
}

/**
 * Convert column letter to index (A -> 0, Z -> 25, AA -> 26, etc.)
 */
export function getColumnIndex(label: string): number {
  let index = 0;
  const upper = label.toUpperCase();

  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }

  return index - 1;
}

/**
 * Parse cell reference string to CellRef (e.g., "A1" -> { row: 0, col: 0 })
 */
export function parseCellRef(ref: string): CellRef | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;

  const col = getColumnIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;

  return { row, col };
}

/**
 * Convert CellRef to string (e.g., { row: 0, col: 0 } -> "A1")
 */
export function cellRefToString(ref: CellRef): string {
  return `${getColumnLabel(ref.col)}${ref.row + 1}`;
}

// Legacy react-spreadsheet helpers removed - now using Fortune-Sheet
