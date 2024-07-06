import React, { useEffect, useState } from "react";
import {
  createTreatment,
  deleteTreatment,
  getBaseTreatmentList,
  getProductsList,
  getProductsListWithId,
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
import { ButtonGroup, ToggleButton } from "react-bootstrap";

const Treatment = ({ selectedEmployee }) => {
  const { authUserState } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [treatmentList, setTreatmentList] = useState([]);
  const [currentTab, setCurrentTab] = useState("employee");

  const [treatmentForm, setTreatmentForm] = useState({
    product_id: "",
    name: "",
    duration: "",
    desc: "",
    cost: "",
    products_used: "",
  });

  const [radioTabs, setRadioTabs] = useState([
    {
      name: "Admin",
      value: "admin",
    },
    {
      name: "Employee",
      value: "employee",
    },
  ]);

  const [showUpdateTreatmentModal, setShowUpdateTreatmentModal] =
    useState(false);
  const [showCreateTreatmentModal, setShowCreateTreatmentModal] =
    useState(false);
  const [sorting, setSorting] = useState([]);

  const getProducts = async (refetch = false) => {
    try {
      const { data } = await getProductsListWithId(
        refetch,
        selectedEmployee.id
      );
      setProductList(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getTreatment = async (refetch = false) => {
    try {
      setTreatmentList([]);
      const { data } = await getTreatmentList(refetch, selectedEmployee.id);
      setTreatmentList(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBaseTreatments = async (refetch = false) => {
    try {
      setTreatmentList([]);
      const response = await getBaseTreatmentList(
        refetch,
        selectedEmployee.id,
        selectedEmployee.is_admin
      );
      const { data } = response || {}; // Use an empty object as default
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
      const payload = {
        name: treatmentForm.name,
        duration: treatmentForm.duration,
        product_id: treatmentForm.product_id,
        description: treatmentForm.desc,
        cost: Number(treatmentForm.cost),
        products_used: Number(treatmentForm.products_used),
        created_by: selectedEmployee.id,
      };
      await createTreatment(payload);
      setTreatmentForm({
        product_id: "",
        name: "",
        duration: "",
        cost: "",
        desc: "",
        products_used: "",
      });
      setShowCreateTreatmentModal(false);
      if (currentTab == "admin") await getBaseTreatments(true);
      else await getTreatment(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onTreatmentDuplicateUpdate = (treatment) => {
    setTreatmentForm({
      id: treatment.id,
      product_id: treatment.product.id,
      name: treatment.name,
      duration: treatment.duration,
      cost: treatment.cost,
      desc: treatment.description,
      products_used: treatment.products_used,
    });
    setShowCreateTreatmentModal(true);
  };

  const onTreatmentUpdate = (treatment) => {
    setTreatmentForm({
      id: treatment.id,
      product_id: treatment.product.id,
      name: treatment.name,
      duration: treatment.duration,
      cost: treatment.cost,
      desc: treatment.description,
      products_used: treatment.products_used,
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
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Duration (in mins)",
      accessorKey: "duration",
    },
    {
      header: "Cost",
      accessorKey: "cost",
    },
    {
      header: "Product Used",
      accessorKey: "products_used",
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
          {!authUserState.user?.is_admin && (
            <div className="flex justify-center space-x-2">
              {currentTab == "admin" ? (
                <Button
                  variant="info"
                  onClick={() => onTreatmentDuplicateUpdate(row.original)}
                >
                  Duplicate
                </Button>
              ) : (
                <>
                  <Button
                    variant="info"
                    onClick={() => onTreatmentUpdate(row.original)}
                  >
                    Update
                  </Button>
                </>
              )}
              {currentTab == "employee" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => onDelete(row.original)}
                  >
                    Remove
                  </Button>
                </>
              )}
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
    if (currentTab == "admin") getBaseTreatments();
    else getTreatment();
  }, [currentTab]);

  return (
    <>
      <div className="mb-2">
        <ButtonGroup className="w-full md:w-auto">
          {radioTabs.map((tab) => {
            return (
              <ToggleButton
                variant="link"
                key={tab.value}
                id={tab.value}
                type="radio"
                className={` !border-none !no-underline !rounded-t-lg !text-cyan-500 
                  ${
                    currentTab === tab.value
                      ? "!bg-gray-400 !text-white pb-2"
                      : "btn-link"
                  }`}
                name="radio"
                value={tab.value}
                checked={currentTab === tab.value}
                onChange={(e) => {
                  setCurrentTab(e.currentTarget.value);
                }}
              >
                {tab.name}
              </ToggleButton>
            );
          })}
        </ButtonGroup>
      </div>
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
            title={
              showUpdateTreatmentModal
                ? "Update Treatment"
                : "Create New Treatment"
            }
            onHide={() => {
              setShowUpdateTreatmentModal(false);
              setShowCreateTreatmentModal(false);
              setTreatmentForm({
                product_id: "",
                name: "",
                duration: "",
                desc: "",
                cost: "",
                products_used: "",
              });
            }}
            footer={
              <div className="flex gap-2">
                {showUpdateTreatmentModal && (
                  <Button
                    onClick={async () => {
                      try {
                        const payload = {
                          name: treatmentForm.name,
                          duration: treatmentForm.duration,
                          product_id: treatmentForm.product_id,
                          description: treatmentForm.desc,
                          cost: Number(treatmentForm.cost),
                          products_used: Number(treatmentForm.products_used),
                        };
                        await updateTreatment(treatmentForm.id, payload);
                        setTreatmentForm({
                          product_id: "",
                          name: "",
                          duration: "",
                          desc: "",
                          cost: "",
                          products_used: "",
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
                    onClick={async (e) => {
                      try {
                        handleSubmitTreatment(e);
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
                type="text"
                placeholder="Enter Description"
                name="desc"
                value={treatmentForm.desc}
                onChange={handleTreatmentChange}
                required
              />
              <Form.Control
                type="number"
                placeholder="Enter Cost"
                name="cost"
                value={treatmentForm.cost}
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
              <Form.Control
                type="number"
                placeholder="Enter Product Units"
                name="products_used"
                value={treatmentForm.products_used}
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
    </>
  );
};

export default Treatment;
