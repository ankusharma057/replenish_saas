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

const ProductTable = ({
  productSearchInput,
  userProfile,
  handleDelete,
  productList,
  setUpdateProductInput,
  setShowUpdateProductModal,
}) => {
  /** @type import("@tanstack/react-table").columnsDef<any>
   */
  const columns = [
    // {
    //   header: "ID",
    //   accessorKey: "id",
    // },
    {
      header: "Product Name",
      accessorKey: "name",
    },
    {
      header: "Product Type",
      accessorKey: "product_type",
    },
    {
      header: "Retail Price",
      accessorKey: "retail_price",
    },
    {
      header: "Cost Price",
      accessorKey: "cost_price",
    },
    {
      header: "Actions",
      accessorKey: "actions",

      cell: ({ row }) => (
        <>
          {userProfile.user?.is_admin && (
            <div className="flex justify-center space-x-2">
              <Button
                onClick={() => {
                  setUpdateProductInput(row.original);
                  setShowUpdateProductModal(true);
                }}
              >
                Update
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(row.original)}
              >
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
    data: productList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter: productSearchInput?.products,
    },

    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },

    // onGlobalFilterChange: (e) =>
    //   setProductSearchInput({
    //     ...productSearchInput,
    //     products: e,
    //   }),
  });

  return (
    <div className="overscroll-y-auto mb-8">
      <div className="flex gap-x-4 justify-end ">
        {/* <Button onClick={() => table.setPageIndex(0)}>First page</Button> */}
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          <ChevronLeft />
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          <ChevronRight />
        </Button>
        {/* <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
          Last page
        </Button> */}
      </div>
      <Table bordered hover responsive className="w-full mt-4 text-center">
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

export default ProductTable;
