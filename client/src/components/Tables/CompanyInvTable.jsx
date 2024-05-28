import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Table, Button } from "react-bootstrap";

const CompanyInvTable = ({
  productSearchInput,
  userProfile,
  inventoryList,
  onAssign,
  onComInvUpdate,
  onDelete,
}) => {
  /** @type import("@tanstack/react-table").columnsDef<any>
   */
  const columns = [
    {
      header: "Product Name",
      accessorKey: "product.name",
    },
    {
      header: "Product Type",
      accessorKey: "product.product_type",
    },
    {
      header: "Available Inv",
      accessorKey: "quantity",
    },
    {
      header: "Replenish Inv",
      accessorKey: "replenish_total_inventory",
    },
    {
      header: "Actions",
      accessorKey: "actions",

      cell: ({ row }) => (
        <>
          {userProfile.user?.is_admin && (
            <div className="flex justify-center space-x-2">
              <Button onClick={() => onAssign(row.original)}>Assign</Button>
              <Button
                variant="info"
                onClick={() => onComInvUpdate(row.original)}
                className="text-white"
              >
                Update
              </Button>
              <Button variant="danger" onClick={() => onDelete(row.original)}>
                Remove
              </Button>
            </div>
          )}
        </>
      ),
    },
  ];

  const [sorting, setSorting] = useState([]);
  const table = useReactTable({
    data: inventoryList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter: productSearchInput?.companyInventory,
    },

    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="overscroll-y-auto mb-8 w-full">
      <div className="flex gap-x-4 justify-end ">
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          variant="info"
          className="text-white"
        >
          <ChevronLeft />
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          variant="info"
          className="text-white"
        >
          <ChevronRight />
        </Button>
      </div>
      <Table
        bordered
        hover
        responsive
        className="w-full mt-4 max-h-[20rem] text-center"
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {
                        { asc: "🔼", desc: "🔽" }[
                          header.column.getIsSorted() ?? null
                        ]
                      }
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                      cell
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default CompanyInvTable;
