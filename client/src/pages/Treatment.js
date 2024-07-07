import React, { useEffect, useState } from "react";
import {
  createTreatment,
  deleteTreatment,
  getBaseTreatmentList,
  getProductsList,
  getTreatmentList,
  updateTreatment,
  getEmployeesList
} from "../Server";
import { Button, Form, Table, ButtonGroup, ToggleButton } from "react-bootstrap";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { useAuthContext } from "../context/AuthUserContext";
import ModalWraper from "../components/Modals/ModalWraper";
import AsideLayout from "../components/Layouts/AsideLayout";
import { ChevronDown } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { FixedSizeList as List } from "react-window";
import { ChevronRight, ChevronLeft } from "lucide-react";

const Treatment = () => {
  const { collapse } = useAsideLayoutContext();
  const { authUserState } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [treatmentList, setTreatmentList] = useState([]);
  const [currentTab, setCurrentTab] = useState("my-treatments");
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(authUserState.user);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [errorForm, setErrorsForm] = useState([]);



  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getEmployeesList(refetch);
      if (data?.length > 0) {
        setEmployeeList(data);
        // handleSelect(data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEmployees();
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [treatmentForm, setTreatmentForm] = useState({
    product_id: "",
    name: "",
    duration: "",
    desc: "",
    cost: "",
    quantity: "",
  });

  const [radioTabs] = useState([
    {
      name: "Base Treatments",
      value: "base-treatments",
    },
    {
      name: "My Treatments",
      value: "my-treatments",
    },
  ]);

  const [showUpdateTreatmentModal, setShowUpdateTreatmentModal] =
    useState(false);
  const [showCreateTreatmentModal, setShowCreateTreatmentModal] =
    useState(false);
  const [sorting, setSorting] = useState([]);

  const getProducts = async (refetch = false) => {
    try {
      const { data } = await getProductsList(
        refetch
      );
      setProductList(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getTreatment = async (refetch = false) => {
    try {
      setTreatmentList([]);
      const { data } = await getTreatmentList(refetch, selectedEmployeeData.id);
      setTreatmentList(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBaseTreatments = async (refetch = false) => {
    try {
      setTreatmentList([]);
      const response = await getBaseTreatmentList(
        refetch
      );
      const { data } = response || {}; // Use an empty object as default
      setTreatmentList(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelect = (emp) => {
    setSelectedEmployeeData(emp);
    if (currentTab === "base-treatments") getBaseTreatments();
    else getTreatment();
  };

  const handleTreatmentChange = (e) => {
    setTreatmentForm((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));

    setErrorsForm({});
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
        quantity: Number(treatmentForm.quantity),
        created_by: selectedEmployeeData.id,
      };
      
      const response = await createTreatment(payload);

      if (response.status === 200) {
        if (response?.data?.error) {
          setErrorsForm(response?.data?.error || {})
        } else {
          setTreatmentForm({
            product_id: "",
            name: "",
            duration: "",
            cost: "",
            desc: "",
            quantity: "",
          });
          setErrorsForm({});

          setShowCreateTreatmentModal(false);
          if (currentTab === "base-treatments") await getBaseTreatments(true);
          else await getTreatment(true);
        }
      }
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
      quantity: treatment.quantity,
    });
    setErrorsForm({});
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
      quantity: treatment.quantity,
    });
    setErrorsForm({});
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
      header: "Quantity",
      accessorKey: "quantity",
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
              {currentTab === "base-treatments" ? (
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
              {currentTab === "my-treatments" && (
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

  const filteredEmployeeList = employeeList?.filter((employee) =>
    employee?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const EmployeeItem = ({ index, style }) => {
    const employee = filteredEmployeeList[index];
    return (
      employee && (
        <div
          style={style}
          onClick={() => {
            selectedEmployeeData?.id !== employee.id && handleSelect(employee);
            if (window.innerWidth < 1024) {
              collapse();
            }
          }}
          className={`p-2 border-b transition-all hover:bg-gray-200 rounded-md duration-700 ${selectedEmployeeData?.id === employee.id
            ? "pointer-events-none bg-gray-200 "
            : "cursor-pointer "
            } `}
        >
          {employee.name || ""}
        </div>
      )
    );
  };


  useEffect(() => {
    getProducts();
    if (currentTab === "base-treatments") getBaseTreatments();
    else getTreatment();
  }, [currentTab]);


  return (
    <>
      <AsideLayout
        hideAsideContent={!authUserState?.user?.is_admin}
        asideContent={
          <>
            <div>
              <SearchInput
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="border-t-2  py-2 bg-white">
              <h1 className="text-xl flex gap-x-2 items-center justify-center">
                All Staff <ChevronDown />
              </h1>
              <div className="flex pb-24 flex-col pl-2 gap-4 overflow-y-auto">
                {(employeeList || []).length > 0 && (
                  <List
                    height={window.innerHeight - 450}
                    itemCount={employeeList.length}
                    itemSize={45}
                    width={"100%"}
                  >
                    {EmployeeItem}
                  </List>
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                setShowCreateUserModal(true);
                setCurrentTab("staff");
              }}
              variant="info"
              className="w-full text-white"
            >
              + Add Employee
            </Button>
          </>
        }>
        <div className="flex py-10 px-6 flex-1 items-center flex-col">
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
                      ${currentTab === tab.value
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
                      setErrorsForm({});
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
                    quantity: "",
                  });
                  setErrorsForm({});
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
                              quantity: Number(treatmentForm.quantity),
                            };

                            const updateResponse = await updateTreatment(treatmentForm.id, payload);

                            if (updateResponse.status === 200) {
                              if (updateResponse?.data?.error) {
                                setErrorsForm(updateResponse?.data?.error || {})
                              } else {
                                setTreatmentForm({
                                  product_id: "",
                                  name: "",
                                  duration: "",
                                  cost: "",
                                  desc: "",
                                  quantity: "",
                                });
                                setErrorsForm({});

                                if (currentTab === "base-treatments") await getBaseTreatments(true);
                                else await getTreatment(true);

                                setShowUpdateTreatmentModal(false);
                              }
                            }
                          } catch (error) {
                            console.log(error);
                          }
                        }}
                      >
                        Update Treatment
                      </Button>
                    )}
                    {showCreateTreatmentModal && (
                      <Button type="submit"
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
                  <Form.Group controlId="formProduct">
                    <Form.Label>Product</Form.Label>
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
                    <span className="text-red-400 text-sm">
                      {errorForm.product_id && errorForm.product_id[0]}
                    </span>
                  </Form.Group>

                  <Form.Group controlId="formTreatmentName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Treatment Name"
                      name="name"
                      value={treatmentForm.name}
                      onChange={handleTreatmentChange}
                      required
                    />
                    <span className="text-red-400 text-sm">
                    {errorForm.name && errorForm.name[0]}
                    </span>
                  </Form.Group>

                  <Form.Group controlId="formTreatmentDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Description"
                      name="desc"
                      value={treatmentForm.desc}
                      onChange={handleTreatmentChange}
                      required
                    />
                    <span className="text-red-400 text-sm">
                    {errorForm.description && errorForm.description[0]}
                    </span>
                  </Form.Group>

                  <Form.Group controlId="formTreatmentCost">
                    <Form.Label>Cost</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Cost"
                      name="cost"
                      value={treatmentForm.cost}
                      onChange={handleTreatmentChange}
                      required
                    />
                    <span className="text-red-400 text-sm">
                      {errorForm.cost && errorForm.cost[0]}
                    </span>
                  </Form.Group>

                  <Form.Group controlId="formTreatmentDuration">
                    <Form.Label>Duration (in mins)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Duration in mins"
                      name="duration"
                      value={treatmentForm.duration}
                      onChange={handleTreatmentChange}
                      required
                    />
                    <span className="text-red-400 text-sm">
                      {errorForm.duration && errorForm.duration[0]}
                    </span>
                  </Form.Group>

                  <Form.Group controlId="formTreatmentQuantity">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter Product Units"
                      name="quantity"
                      value={treatmentForm.quantity}
                      onChange={handleTreatmentChange}
                      required
                    />
                    <span className="text-red-400 text-sm">
                      {errorForm.quantity && errorForm.quantity[0]}
                    </span>
                  </Form.Group>
                </Form>
              </ModalWraper>
            </div>
            <div className="flex gap-x-4 justify-end mt-4 ">
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
        </div>
      </AsideLayout>

    </>
  );
};

export default Treatment;
