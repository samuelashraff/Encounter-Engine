import type { GridCell } from "../App";

// Helper function to import grid/session from JSON file
export function importGame(
    file: File,
    onImport: (grid: GridCell[]) => void,
    onError?: (msg: string) => void
) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            if (data.grid && Array.isArray(data.grid)) {
                onImport(data.grid);
            } else {
                onError?.("Invalid file format: missing or malformed grid.");
            }
        } catch (err) {
            onError?.("Could not parse file. Make sure it's a valid exported game JSON.");
        }
    };
    reader.readAsText(file);
}

// Helper function to export grid/session as JSON file
export function exportGame(grid: GridCell[]) {
    const dataToExport = { grid };
    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "encounter-grid.json";
    a.click();
    URL.revokeObjectURL(url);
}