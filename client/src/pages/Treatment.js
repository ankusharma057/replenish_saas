import React, { useEffect, useState } from "react";
import {
  createTreatment,
  deleteTreatment,
  getProductsList,
  getTreatmentList,
  updateTreatment,
} from "../Server";
import { Button, Form, Table } from "react-bootstrap";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthUserContext";
import ModalWraper from "../components/Modals/ModalWraper";

const Treatment = () => {
  const { authUserState } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [treatmentList, setTreatmentList] = useState([]);
  const [treatmentForm, setTreatmentForm] = useState({
    product_id: "",
    name: "",
    duration: "",
  });
  const [showUpdateTreatmentModal, setShowUpdateTreatmentModal] =
    useState(false);
  const [showCreateTreatmentModal, setShowCreateTreatmentModal] =
    useState(false);
  const [sorting, setSorting] = useState([]);

  const getProducts = async (refetch = false) => {
    try {
      const { data } = await getProductsList(refetch);
      setProductList(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getTreatment = async (refetch = false) => {
    try {
      const { data } = await getTreatmentList(refetch);
      setTreatmentList(data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleTreatmentChange = (e) => {
    setTreatmentForm((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmitTreatment = async (e) => {
    e.preventDefault();
    try {
      await createTreatment(treatmentForm);
      setTreatmentForm({
        product_id: "",
        name: "",
        duration: "",
      });
      await getTreatment(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onTreatmentUpdate = (treatment) => {
    setTreatmentForm({
      id: treatment.id,
      product_id: treatment.product.id,
      name: treatment.name,
      duration: treatment.duration,
    });
    setShowUpdateTreatmentModal(true);
  };
  const onDelete = (treatment) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to delete ${treatment?.name} `,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const { data } = await deleteTreatment(treatment.id);
              toast.success(`${treatment?.name} Deleted Successfully.`);
              await getTreatment(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to Delete the Treatment."
              );
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            // setshowModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };
  const columns = [
    {
      header: "Product Name",
      accessorKey: "product.name",
    },
    {
      header: "Treatment Name",
      accessorKey: "name",
    },
    {
      header: "Duration (in mins)",
      accessorKey: "duration",
    },
    {
      header: "Cost Price",
      accessorKey: "product.cost_price",
    },
    {
      header: "Retails Price",
      accessorKey: "product.retail_price",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <>
          {authUserState.user?.is_admin && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="info"
                onClick={() => onTreatmentUpdate(row.original)}
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
  const table = useReactTable({
    data: treatmentList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter: searchInput,
    },

    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  useEffect(() => {
    getProducts();
    getTreatment();
  }, []);

  return (
    <div className="m-4">
      <div className="flex items-center gap-x-1 md:gap-x-2">
        <div className="flex items-center gap-x-2 flex-1 relative">
          <Form.Control
            placeholder="Search Product Name here"
            aria-label="Search Product Name here"
            className="pr-4!"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
            }}
          />
          <div>
            <Button
              onClick={() => {
                console.log("Click");
                setShowCreateTreatmentModal(true);
              }}
              className="truncate rounded-full !text-sm md:!text-base"
            >
              Add Treatment
            </Button>
          </div>
        </div>
        <ModalWraper
          show={showUpdateTreatmentModal || showCreateTreatmentModal}
          title={showUpdateTreatmentModal ? "Update Treatment" : "Create New Treatment"}
          onHide={() => {
            setShowUpdateTreatmentModal(false);
            setShowCreateTreatmentModal(false);
            setTreatmentForm({
              product_id: "",
              name: "",
              duration: "",
            });
          }}
          footer={
            <div className="flex gap-2">
              {showUpdateTreatmentModal && (
                <Button
                  onClick={async () => {
                    try {
                      await updateTreatment(treatmentForm.id, treatmentForm);
                      setTreatmentForm({
                        product_id: "",
                        name: "",
                        duration: "",
                      });
                      await getTreatment(true);
                      setShowUpdateTreatmentModal(false);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  Update Treatment
                </Button>
              )}
              {showCreateTreatmentModal && (
                <Button
                  onClick={async () => {
                    try {
                      await createTreatment(treatmentForm);
                      setTreatmentForm({
                        product_id: "",
                        name: "",
                        duration: "",
                      });
                      await getTreatment(true);
                      setShowCreateTreatmentModal(false);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  Create Treatment
                </Button>
              )}
            </div>
          }
        >
          <Form
            className="flex flex-col gap-4"
            onSubmit={handleSubmitTreatment}
          >
            <Form.Select
              aria-label="Default select example"
              name="product_id"
              value={treatmentForm.product_id}
              onChange={handleTreatmentChange}
              required
              disabled={showUpdateTreatmentModal}
            >
              <option>Select Product</option>
              {productList.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name}
                </option>
              ))}
            </Form.Select>

            <Form.Control
              type="text"
              placeholder="Enter Treatment Name"
              name="name"
              value={treatmentForm.name}
              onChange={handleTreatmentChange}
              required
            />
            <Form.Control
              type="number"
              placeholder="Enter Duration in mins"
              name="duration"
              value={treatmentForm.duration}
              onChange={handleTreatmentChange}
              required
            />
          </Form>
        </ModalWraper>
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

export default Treatment;
