import React, { useMemo } from "react";
import Papa from "papaparse";
import { cn } from "../../utils";
import { ViewerMessage } from "./status";
import { useFileText } from "./use-file-text";
import type { FileRendererProps } from "./types";

/** Renders a CSV as a table. The first row is treated as the header. All cell
 * values are strings rendered as React children (escaped), so CSV content can't
 * inject markup. */
const CsvViewer = ({ uri }: FileRendererProps) => {
  const { text, loading, error } = useFileText(uri);

  const rows = useMemo<string[][]>(() => {
    if (!text) return [];
    const parsed = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
    return parsed.data;
  }, [text]);

  if (loading) return <ViewerMessage>Loading…</ViewerMessage>;
  if (error) return <ViewerMessage>Unable to load this file.</ViewerMessage>;
  if (!rows.length) return <ViewerMessage>This file is empty.</ViewerMessage>;

  const [header, ...body] = rows;

  return (
    <div className="overflow-auto p-4">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th
                key={i}
                className={cn(
                  "text-klerosUIComponentsPrimaryText font-semibold",
                  "border-klerosUIComponentsStroke border-b px-3 py-2",
                )}
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    "text-klerosUIComponentsSecondaryText",
                    "border-klerosUIComponentsStroke border-b px-3 py-2",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CsvViewer;
