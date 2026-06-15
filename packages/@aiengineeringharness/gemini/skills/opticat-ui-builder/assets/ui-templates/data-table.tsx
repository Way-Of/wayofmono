// .gemini/skills/opticat-ui-builder/assets/ui-templates/data-table.tsx
import React from 'react';

interface DataTableProps<T> {
  data: T[];
  columns: { header: string; accessor: keyof T | ((item: T) => React.ReactNode) }[];
  className?: string;
}

export const DataTable = <T,>({ data, columns, className }: DataTableProps<T>) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead className="border-b border-[#3c3c3c]">
          <tr className="text-left text-[#999]">
            {columns.map((column, idx) => (
              <th key={idx} className="p-3">{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3c3c3c]">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="p-3">
                  {typeof column.accessor === 'function'
                    ? column.accessor(item)
                    : item[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
