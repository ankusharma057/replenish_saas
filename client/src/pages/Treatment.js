import React, { useEffect, useState, useMemo } from "react";
import {
  createTreatment,
  deleteTreatment,
  getBaseTreatmentList,
  getTreatmentProductsOnly,
  getTreatmentIntakeForms,
  getTreatmentList,
  updateTreatment,
  getEmployeesListOnly,
  getTreatmentIntakeForm
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
import Select from "react-select";
import { RxCross2 } from "react-icons/rx";

const Treatment = () => {
  const { collapse } = useAsideLayoutContext();
  const { authUserState } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [intakeForm, setIntakeForm] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [treatmentList, setTreatmentList] = useState([]);
  const [currentTab, setCurrentTab] = useState("my-treatments");
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(authUserState.user);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [errorForm, setErrorsForm] = useState([]);
  const [loading, setLoading] = useState(false);


  const getEmployees = async (refetch = true) => {
    try {
      const { data } = await getEmployeesListOnly(refetch);
      if (data?.length > 0) {
        setEmployeeList(data);
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
    treatment_intake_forms_attributes: [],
  });

  const [existingForms, setExistingForms] = useState([]);

  const [radioTabs] = useState([
    {
      name: "Treatments",
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
    const [changes,setChanges] = useState(false)
    useEffect(()=>{setChanges(false)},[showUpdateTreatmentModal,showCreateTreatmentModal])
    console.log("dnuahcfushdc", changes);
  const [sorting, setSorting] = useState([]);

  const closeModel = (stage) => {
    if(stage){
    setShowUpdateTreatmentModal(false);
    setShowCreateTreatmentModal(false);
    setTreatmentForm({
      product_id: "",
      name: "",
      duration: "",
      desc: "",
      cost: "",
      quantity: "",
      treatment_intake_forms_attributes: [],
      });
    setErrorsForm({});
  }
  }

  const getProducts = async (refetch = false) => {
    try {
      const { data } = await getTreatmentProductsOnly(
        refetch
      );
      setProductList(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getIntakeForm = async (treatmentId, refetch = false) => {
    try {
      const { data } = await getTreatmentIntakeForms(treatmentId, refetch);
        setIntakeForm(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getTreatment = async (refetch = false, emp = {}) => {
    try {
      let empId;
      if (emp.id) {
        empId = emp.id
      } else {
        empId = selectedEmployeeData.id
      }

      setTreatmentList([]);
      const { data } = await getTreatmentList(refetch, empId);
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
    else getTreatment(true, emp);
  };

  const getAllTreatmentIntakeForms = async (treatmentId, refetch = true) => {
    try {
      const { data }  = await getTreatmentIntakeForm(treatmentId, refetch);
        setExistingForms(data?.treatment_intake_forms)
    } catch (error) {
      console.log(error);
    }
  };

  const handleTreatmentChange = (e) => {
    setChanges(true)
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
        treatment_intake_forms_attributes: [...treatmentForm.treatment_intake_forms_attributes],
      };

      const response = await createTreatment(payload);

      if (response.status === 200) {
        toast.success("Treatment Created Successfully");
        if (response?.data?.error) {
          toast.error(response?.data?.error?.name || "Failed to create treatment");
          setErrorsForm(response?.data?.error || {})
        } else {
          setTreatmentForm({
            product_id: "",
            name: "",
            duration: "",
            cost: "",
            desc: "",
            quantity: "",
            treatment_intake_forms_attributes: [],
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
      treatment_intake_forms_attributes: [],
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
      treatment_intake_forms_attributes: [], // Reset new intake forms
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
              const { data } = await deleteTreatment(treatment.id, true);
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
      header: "Intake Forms",
      accessorKey: "treatment_intake_forms_attributes",
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
                onClick={() =>{ onTreatmentUpdate(row.original); getIntakeForm(row.original?.id); getAllTreatmentIntakeForms(row.original?.id, true)}}
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
                  onClick={() =>{ onTreatmentDuplicateUpdate(row.original); getIntakeForm(row.original?.id)}}
                >
                  Duplicate
                </Button>
              ) : (
                <>
                  <Button
                    variant="info"
                    onClick={() =>{ onTreatmentUpdate(row.original); getIntakeForm(row.original?.id); getAllTreatmentIntakeForms(row.original?.id, true)}}
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
    getProducts(true);
    getIntakeForm("", true);
    if (currentTab === "base-treatments") getBaseTreatments();
    else getTreatment();
  }, [currentTab]);


  const removeIntakeForm = async (intakeFormDetails) => {
    confirmAlert({
      title: "Remove Intake Form",
      message: `Are you sure you want to remove ${String(intakeFormDetails?.name)} from your list?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              getAllTreatmentIntakeForms(treatmentForm?.id, true)
              const deleteIntakeForms = {
                treatment_intake_forms_attributes: [
                  { id: intakeFormDetails.id, _destroy: 1 },
                ],
              };
              const { data } = await updateTreatment(treatmentForm?.id, deleteIntakeForms, true);
              toast.success("Intake Form removed successfully.");
              await getEmployees(true);
              setExistingForms(data?.treatment_intake_forms)
              setSelectedEmployeeData(selectedEmployeeData);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                error?.response?.statusText ||
                error.message ||
                "Failed to remove Intake Form."
              );
            } finally {
              setLoading(false);
            };
            getIntakeForm(treatmentForm?.id);
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

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
                      setShowCreateTreatmentModal(true);
                      setErrorsForm({});
                      // setExistingForms([]);
                      getIntakeForm("", true);

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
                  if(changes){
                    confirmAlert({
                      title: "Confirm to Close",
                      message: `Are you Discard the Changes ?`,
                      buttons: [
                        {
                          label: "Yes",
                          onClick:  () => {
                            closeModel(true)
                          },
                        },
                        {
                          label: "No",
                          onClick: () => {
                            closeModel(false)
                          },
                        },
                      ],
                    });
                  }
                  else{
                    closeModel(true)
                }}}
                footer={
                  <div className="flex gap-2">
                    {showUpdateTreatmentModal  && (
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
                              treatment_intake_forms_attributes: [...treatmentForm.treatment_intake_forms_attributes],
                            };
                            const updateResponse = await updateTreatment(treatmentForm.id, payload, true);
                            if (updateResponse.status === 200) {
                              toast.success("Treatment Updated Successfully");
                              setExistingForms(updateResponse?.data?.treatment_intake_forms)
                              getAllTreatmentIntakeForms(updateResponse?.data?.id, true)
                              if (updateResponse?.data?.error) {
                                toast.error(updateResponse?.data?.error?.name || "Failed to update treatment");
                                setErrorsForm(updateResponse?.data?.error || {})
                              } else {
                                setTreatmentForm({
                                  product_id: "",
                                  name: "",
                                  duration: "",
                                  cost: "",
                                  desc: "",
                                  quantity: "",
                                  treatment_intake_forms_attributes: [],
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

                  <Form.Group controlId="formIntakeForm">
                    <Form.Label>Intake Forms</Form.Label>
                    <div className="flex flex-1 relative mt-2">
                      <Select
                        className="flex-fill flex-grow-1"
                        inputId="product_type"
                        isMulti
                        onChange={(event) => {
                          const transformedLocations = event.map(({ id }) => {
                            const selectedForm = intakeForm.find((form) => form.id === id);
                            return {
                              intake_form_id: id,
                              treatment_id: treatmentForm.id,
                              intake_form: selectedForm, // Ensure intake_form is included
                            };
                          });

                          setTreatmentForm((pre) => ({
                            ...pre,
                            treatment_intake_forms_attributes: transformedLocations,
                          }));
                        }}
                        options={intakeForm?.map((intakeForm) => ({
                          value: intakeForm.id,
                          label: intakeForm.name,
                          id: intakeForm.id
                        }))}
                        required
                        placeholder="Select Intake Forms"
                      />
                    </div>
                    {showUpdateTreatmentModal && (
                      <table className="w-full mt-2 text-sm text-left rtl:text-right text-gray-500 ">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Intake Form
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                        {existingForms.map((val, index) => (
                          <React.Fragment key={index}>
                              <EmployeeLocationTableRows
                                removeIntakeForm={removeIntakeForm}
                                val={val}
                              />
                          </React.Fragment>
                        ))}
                        </tbody>
                      </table>
                    )}
                    <span className="text-red-400 text-sm">
                      {errorForm.treatment_intake_forms_attributes && errorForm.treatment_intake_forms_attributes[0]}
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

const EmployeeLocationTableRows = ({ val, removeIntakeForm }) => {
  return (
    <tr className="odd:bg-white even:bg-gray-50 border-b ">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap capitalize "
      >
        {val.intake_form?.name}
      </th>
      <td className="px-6 py-4 w-14">
        <div className="flex justify-center"> 
        {!val.intake_form_id && (
          <button
            type="button"
            onClick={() => removeIntakeForm(val)}
            className="hover:text-red-500 text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
          >
            <RxCross2 className="w-6 h-6" />
          </button>
        )}
        </div>
      </td>
    </tr>
  );
};

export default Treatment;
