import React from "react";
import { buttonStyle, type PageSize } from "./DataTableUtils";

export const HighlightText: React.FC<{
  text: string;
  query: string;
}> = ({ text, query }) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return <>{text}</>;
  }

  const normalizedText = text.toLowerCase();
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark
        style={{
          backgroundColor: "#fde68a",
          color: "#111827",
          borderRadius: "3px",
          padding: "0 2px",
        }}
      >
        {text.slice(matchIndex, matchIndex + normalizedQuery.length)}
      </mark>
      {text.slice(matchIndex + normalizedQuery.length)}
    </>
  );
};

export const PaginationControls: React.FC<{
  currentPage: number;
  pageSize: PageSize;
  totalRows: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}> = ({ currentPage, pageSize, totalRows, onPageChange, onPageSizeChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        borderTop: "1px solid #374151",
        color: "#9ca3af",
        fontSize: "13px",
      }}
    >
      <div>
        Showing {startRow} to {endRow} of {totalRows}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>Rows</span>
        <select
          value={pageSize}
          onChange={(event) => {
            onPageSizeChange(Number(event.target.value) as PageSize);
          }}
          style={{
            height: "32px",
            borderRadius: "6px",
            border: "1px solid #374151",
            backgroundColor: "#111827",
            color: "#e5e7eb",
            padding: "0 8px",
          }}
        >
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            ...buttonStyle,
            height: "32px",
            opacity: currentPage === 1 ? 0.4 : 1,
          }}
        >
          Prev
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            ...buttonStyle,
            height: "32px",
            opacity: currentPage === totalPages ? 0.4 : 1,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};
