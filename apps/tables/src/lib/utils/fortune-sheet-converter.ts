/**
 * Fortune-Sheet Data Converter
 *
 * Converts between our SpreadsheetData format and Fortune-Sheet's format
 * for seamless Firestore storage and rendering.
 */

import type {
  SpreadsheetData,
  SpreadsheetCell,
  CellFormat,
  CellMap,
} from "../types/spreadsheet";
import { getColumnLabel } from "../types/spreadsheet";
import type { Sheet, Cell, CellWithRowAndCol } from "@fortune-sheet/core";

// ============ Conversion Functions ============

/**
 * Convert our SpreadsheetData to Fortune-Sheet format
 */
export function toFortuneSheetData(
  data: SpreadsheetData | undefined,
  sheetName: string = "Sheet1"
): Sheet[] {
  // If no data, return empty sheet
  if (!data) {
    return [createEmptyFortuneSheet(sheetName)];
  }

  const celldata: CellWithRowAndCol[] = [];

  // Convert sparse cell map to celldata array
  for (const [key, cell] of Object.entries(data.cells)) {
    const match = key.match(/^r(\d+)c(\d+)$/);
    if (match && cell && cell.value !== null && cell.value !== undefined && cell.value !== "") {
      const rowIndex = parseInt(match[1], 10);
      const colIndex = parseInt(match[2], 10);
      celldata.push({
        r: rowIndex,
        c: colIndex,
        v: convertCellToFortuneSheet(cell),
      });
    }
  }

  // Build column widths config
  const columnlen: Record<number, number> = {};
  data.columns.forEach((col, index) => {
    if (col.width && col.width !== data.defaultColumnWidth) {
      columnlen[index] = col.width;
    }
  });

  // Build row heights config
  const rowlen: Record<number, number> = {};
  data.rows.forEach((row, index) => {
    if (row.height && row.height !== data.defaultRowHeight) {
      rowlen[index] = row.height;
    }
  });

  // Build hidden columns
  const colhidden: Record<number, number> = {};
  data.columns.forEach((col, index) => {
    if (col.hidden) {
      colhidden[index] = 0;
    }
  });

  // Build hidden rows
  const rowhidden: Record<number, number> = {};
  data.rows.forEach((row, index) => {
    if (row.hidden) {
      rowhidden[index] = 0;
    }
  });

  // Build frozen config
  let frozen: Sheet["frozen"];
  if (data.frozenRows && data.frozenColumns) {
    frozen = {
      type: "rangeBoth",
      range: {
        row_focus: data.frozenRows - 1,
        column_focus: data.frozenColumns - 1,
      },
    };
  } else if (data.frozenRows) {
    frozen = {
      type: "rangeRow",
      range: { row_focus: data.frozenRows - 1, column_focus: 0 },
    };
  } else if (data.frozenColumns) {
    frozen = {
      type: "rangeColumn",
      range: { row_focus: 0, column_focus: data.frozenColumns - 1 },
    };
  }

  const sheet: Sheet = {
    name: sheetName,
    id: "sheet_01",
    status: 1,
    order: 0,
    row: Math.max(data.rowCount || data.rows.length, 100),
    column: Math.max(data.colCount || data.columns.length, 26),
    defaultRowHeight: data.defaultRowHeight || 24,
    defaultColWidth: data.defaultColumnWidth || 100,
    celldata,
    config: {
      columnlen: Object.keys(columnlen).length > 0 ? columnlen : undefined,
      rowlen: Object.keys(rowlen).length > 0 ? rowlen : undefined,
      colhidden: Object.keys(colhidden).length > 0 ? colhidden : undefined,
      rowhidden: Object.keys(rowhidden).length > 0 ? rowhidden : undefined,
    },
    frozen,
    showGridLines: 1,
  };

  return [sheet];
}

/**
 * Convert Fortune-Sheet data back to our SpreadsheetData format
 */
export function fromFortuneSheetData(
  sheets: Sheet[],
  existingData?: SpreadsheetData
): SpreadsheetData {
  // Use first sheet (we only support single sheet for now)
  const sheet = sheets[0];
  if (!sheet) {
    return existingData || createEmptySpreadsheetData();
  }

  const rowCount = sheet.row || 100;
  const colCount = sheet.column || 26;

  // Build sparse cell map - Fortune-Sheet uses 'data' (2D array) for live data
  const cells: CellMap = {};

  // First try sheet.data (2D array - this is where live edits go)
  if (sheet.data && Array.isArray(sheet.data)) {
    for (let r = 0; r < Math.min(sheet.data.length, rowCount); r++) {
      const row = sheet.data[r];
      if (!row) continue;
      for (let c = 0; c < Math.min(row.length, colCount); c++) {
        const cell = row[c];
        if (cell && (cell.v !== null && cell.v !== undefined && cell.v !== "")) {
          const convertedCell = convertCellFromFortuneSheet(cell);
          if (convertedCell.value !== null && convertedCell.value !== undefined && convertedCell.value !== "") {
            cells[`r${r}c${c}`] = convertedCell;
          }
        }
      }
    }
  }
  // Fallback to celldata (sparse array - used for initial load)
  else if (sheet.celldata) {
    sheet.celldata.forEach((cell) => {
      if (cell.v && cell.r < rowCount && cell.c < colCount) {
        const convertedCell = convertCellFromFortuneSheet(cell.v);
        if (convertedCell.value !== null && convertedCell.value !== undefined && convertedCell.value !== "") {
          cells[`r${cell.r}c${cell.c}`] = convertedCell;
        }
      }
    });
  }

  // Build column definitions
  const columns = Array.from({ length: colCount }, (_, i) => ({
    id: `col-${i}`,
    name: getColumnLabel(i),
    width: sheet.config?.columnlen?.[i] || sheet.defaultColWidth || 100,
    hidden: sheet.config?.colhidden?.[i] !== undefined,
  }));

  // Build row definitions
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    id: `row-${i}`,
    height: sheet.config?.rowlen?.[i] || sheet.defaultRowHeight || 24,
    hidden: sheet.config?.rowhidden?.[i] !== undefined,
  }));

  // Extract frozen info
  let frozenRows: number | undefined;
  let frozenColumns: number | undefined;

  if (sheet.frozen) {
    const frozenType = sheet.frozen.type;
    const range = sheet.frozen.range;

    if (frozenType === "row" || frozenType === "rangeRow" || frozenType === "rangeBoth" || frozenType === "both") {
      frozenRows = (range?.row_focus ?? 0) + 1;
    }
    if (frozenType === "column" || frozenType === "rangeColumn" || frozenType === "rangeBoth" || frozenType === "both") {
      frozenColumns = (range?.column_focus ?? 0) + 1;
    }
  }

  const result: SpreadsheetData = {
    cells,
    columns,
    rows,
    rowCount,
    colCount,
    defaultColumnWidth: sheet.defaultColWidth || 100,
    defaultRowHeight: sheet.defaultRowHeight || 24,
  };

  // Only include frozen values if they're defined (Firestore doesn't accept undefined)
  if (frozenRows !== undefined) result.frozenRows = frozenRows;
  if (frozenColumns !== undefined) result.frozenColumns = frozenColumns;

  return result;
}

/**
 * Convert a single cell to Fortune-Sheet format
 */
function convertCellToFortuneSheet(cell: SpreadsheetCell): Cell {
  const value: Cell = {};

  // Set value and type
  if (cell.value !== null && cell.value !== undefined) {
    value.v = cell.value;
    value.m = String(cell.value);

    // Set type based on cell type
    if (cell.type === "number" || typeof cell.value === "number") {
      value.ct = { fa: "General", t: "n" };
    } else if (cell.type === "boolean" || typeof cell.value === "boolean") {
      value.ct = { fa: "General", t: "b" };
    } else {
      value.ct = { fa: "General", t: "s" };
    }
  }

  // Set formula
  if (cell.formula) {
    value.f = cell.formula;
  }

  // Apply formatting
  if (cell.format) {
    const fmt = cell.format;
    if (fmt.bold) value.bl = 1;
    if (fmt.italic) value.it = 1;
    if (fmt.underline) value.un = 1;
    if (fmt.strikethrough) value.cl = 1;
    if (fmt.textColor) value.fc = fmt.textColor;
    if (fmt.backgroundColor) value.bg = fmt.backgroundColor;
    if (fmt.fontSize) value.fs = fmt.fontSize;

    // Text alignment
    if (fmt.textAlign === "left") value.ht = 1;
    else if (fmt.textAlign === "center") value.ht = 0;
    else if (fmt.textAlign === "right") value.ht = 2;
  }

  return value;
}

/**
 * Convert Fortune-Sheet cell back to our format
 */
function convertCellFromFortuneSheet(v: Cell): SpreadsheetCell {
  const cell: SpreadsheetCell = {
    value: v.v ?? null,
  };

  // Set type
  if (v.ct?.t === "n") {
    cell.type = "number";
  } else if (v.ct?.t === "b") {
    cell.type = "boolean";
  } else if (v.ct?.t === "d") {
    cell.type = "date";
  } else {
    cell.type = "text";
  }

  // Set formula
  if (v.f) {
    cell.formula = v.f;
    cell.type = "formula";
  }

  // Extract formatting
  const format: CellFormat = {};
  let hasFormat = false;

  if (v.bl === 1) { format.bold = true; hasFormat = true; }
  if (v.it === 1) { format.italic = true; hasFormat = true; }
  if (v.un === 1) { format.underline = true; hasFormat = true; }
  if (v.cl === 1) { format.strikethrough = true; hasFormat = true; }
  if (v.fc) { format.textColor = v.fc; hasFormat = true; }
  if (v.bg) { format.backgroundColor = v.bg; hasFormat = true; }
  if (v.fs) { format.fontSize = v.fs; hasFormat = true; }

  if (v.ht === 0) { format.textAlign = "center"; hasFormat = true; }
  else if (v.ht === 1) { format.textAlign = "left"; hasFormat = true; }
  else if (v.ht === 2) { format.textAlign = "right"; hasFormat = true; }

  if (hasFormat) {
    cell.format = format;
  }

  return cell;
}

/**
 * Create empty Fortune-Sheet data
 */
export function createEmptyFortuneSheet(name: string = "Sheet1"): Sheet {
  return {
    name,
    id: "sheet_01",
    status: 1,
    order: 0,
    row: 100,
    column: 26,
    defaultRowHeight: 24,
    defaultColWidth: 100,
    celldata: [],
    config: {},
    showGridLines: 1,
  };
}

/**
 * Create empty SpreadsheetData
 */
function createEmptySpreadsheetData(): SpreadsheetData {
  const colCount = 26;
  const rowCount = 100;

  return {
    cells: {}, // Empty sparse map
    columns: Array.from({ length: colCount }, (_, i) => ({
      id: `col-${i}`,
      name: getColumnLabel(i),
      width: 100,
    })),
    rows: Array.from({ length: rowCount }, (_, i) => ({
      id: `row-${i}`,
      height: 24,
    })),
    rowCount,
    colCount,
    defaultColumnWidth: 100,
    defaultRowHeight: 24,
  };
}
