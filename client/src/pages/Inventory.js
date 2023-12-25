import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Table, Form } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert"; // Import
import AssignModal from "../components/Modals/AssignModal";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import { useAuthContext } from "../context/AuthUserContext";
import {
  acceptRequestInventory,
  assignInvManagerOrAdminInventory,
  createInventory,
  deleteInvProduct,
  getEmployeesList,
  getInventoryList,
  getProductsList,
  getRequestInventory,
  rejectRequestInventory,
  updateInvProduct,
} from "../Server";
import DataFilterService from "../services/DataFilterService";
import ModalWraper from "../components/Modals/ModalWraper";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import LabelInput from "../components/Input/LabelInput";
import Select from "react-select";
import ProductsTab from "../components/Tabs/ProductsTab";
import CompanyInvTable from "../components/Tables/CompanyInvTable";
const Inventory = () => {
  const { authUserState } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [productInfoInput, setProductInfoInput] = useState({
    quantity: 0,
  });
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
  const [showAssignMadal, setShowAssignMadal] = useState(false);
  const [assignProductData, setAssignProductData] = useState({});
  const [assignInput, setAssignInput] = useState({
    quantity: 0,
    employee_name: "",
  });

  const [productList, setProductList] = useState([]);

  const [employeeList, setEmployeeList] = useState([]);
  const [totalEmpInventory, settotalEmpInventory] = useState({});

  const [radioValue, setRadioValue] = useState("companyInventory");
  const [filterInventory, setFilterInventory] = useState([]);
  const [productSearchInput, setProductSearchInput] = useState({
    companyInventory: "",
    empInventories: "",
    inventoryRequest: "",
    products: "",
  });
  const [requestedInventoryData, setRequestedInventoryData] = useState([]);

  // added
  const getProducts = async () => {
    try {
      const { data } = await getProductsList();
      if (data) {
        setProductList(
          DataFilterService.specialInvManeger(
            data,
            authUserState.user?.has_access_only_to,
            authUserState.user?.is_admin,
            true
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  // added
  const getInventory = async (refetch = false) => {
    try {
      const { data } = await getInventoryList(refetch);
      const filterInventoryList = DataFilterService.specialInvManeger(
        data,
        authUserState.user?.has_access_only_to,
        authUserState.user?.is_admin
      );
      setFilterInventory(filterInventoryList);
      // setInventoryList(data);
    } catch (error) {
      console.log(error);
      // handle error
    }
  };

  useEffect(() => {
    getInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // added
  const getEmployees = async (onlyList = false, refetch = false) => {
    try {
      const { data } = await getEmployeesList(refetch);
      if (onlyList) {
        setEmployeeList(data);
        return;
      } else {
        settotalEmpInventory(
          DataFilterService.totalEmployeesInventory(data, authUserState)
        );
        return setEmployeeList(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // added
  const getRequestInventoryData = async (refetch = false) => {
    const { data } = await getRequestInventory(refetch);
    setRequestedInventoryData(data);
  };

  const deleteSubmit = (inventory) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to delete ${inventory?.product?.name} `,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const { data } = await deleteInvProduct(inventory.id);
              console.log(data);
              toast.success(
                `${inventory?.product?.name} Deleted Successfully.`
              );
              await getInventory(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to Delete the Inventory."
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

  const updateProductSubmit = (e) => {
    e.preventDefault();
    setShowUpdateProductModal(false);

    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to Update Quantity for ${productInfoInput?.product_name} `,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setShowUpdateProductModal(true);
              setLoading(true);
              await updateInvProduct(productInfoInput?.id, productInfoInput);
              await getInventory(true);
              toast.success("Product Updated Successfully.");
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to Update the Product "
              );
            } finally {
              setLoading(false);
              setShowUpdateProductModal(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            setShowUpdateProductModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };

  const createProductSubmit = (e) => {
    e.preventDefault();
    setShowUpdateProductModal(false);

    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to Create/Update Inventory for ${productInfoInput.product_name} `,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setShowUpdateProductModal(true);
              setLoading(true);
              await createInventory(productInfoInput);
              toast.success(" Product Created  Successfully.");
              await getInventory(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to Create the Product"
              );
            } finally {
              setLoading(false);
              setShowUpdateProductModal(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            setShowUpdateProductModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };

  const assignSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...assignInput,
      product_name: assignProductData?.product?.name,
      product_id: assignProductData?.product?.id,
    };

    try {
      setLoading(true);
      // eslint-disable-next-line no-unused-vars
      const { data } = await assignInvManagerOrAdminInventory(
        assignProductData?.id,
        productData
      );
      toast.success(
        authUserState.user?.is_admin
          ? "Assigned the Inventory to the Employee"
          : "Prompted Employee for the inventory."
      );
      await getEmployees(true, true);
      await getInventory(true);
    } catch (error) {
      console.log(error);
      toast.error(
        error?.response?.data?.exception ||
          error.response.statusText ||
          error.message ||
          "Failed to assign the inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptRequestInventorySubmit = (data) => {
    if (Number(data?.quantity_asked) > Number(data.inventory.quantity)) {
      return toast.error(
        "You do not have enough inventories to fulfill this, please update first",
        {
          autoClose: false,
        }
      );
    } else {
      confirmAlert({
        title: "Confirm to submit",
        message: `Are you sure to Accept Invetory `,
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              try {
                await acceptRequestInventory(data.id);
                toast.success("You have accept this inventory Successfully.");
                await getRequestInventoryData(true);
              } catch (error) {
                toast.error(
                  error?.response?.data?.exception ||
                    error.response.statusText ||
                    error.message ||
                    "You do not have enough Available Inventory for this product "
                );
              }
            },
          },
          {
            label: "No",
            onClick: () => {
              //  setShowUpdateProductModal(true);
              console.log("Click No");
            },
          },
        ],
      });
    }
  };

  const rejectRequestInventorySubmit = (data) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to Reject Invetory `,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await rejectRequestInventory(data.id);
              toast.success("You have reject this inventory Successfully.");
              await getRequestInventoryData(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to Reject the Inventory "
              );
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            //  setShowUpdateProductModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };

  const onAssign = (data) => {
    getEmployees(true);
    setAssignProductData(data);
    setShowAssignMadal(true);
  };

  const onComInvUpdate = (data) => {
    setProductInfoInput({
      update: true,
      quantity: data.quantity,
      product_type: data?.product?.product_type,
      product_name: data?.product?.name,
      id: data?.product?.id,
      maxQty: data?.quantity,
    });
    setShowUpdateProductModal(true);
  };

  const radios = [
    { name: "Company Inventory", value: "companyInventory" },
    {
      name: "Emp Inventories",
      value: "empInventories",
      data: getEmployees,
    },
    {
      name: "Inventory Request ",
      value: "inventoryRequest",
      data: getRequestInventoryData,
    },

    {
      name: "Products",
      value: "products",
      // data: getRequestInventoryData,
    },
  ];

  const options = productList?.map((product) => {
    return {
      value: product?.name,
      label: product?.name,
    };
  });

  return (
    <>
      <AssignModal
        showAssignMadal={showAssignMadal}
        setShowAssignMadal={setShowAssignMadal}
        assignSubmit={assignSubmit}
        assignProductData={assignProductData}
        setAssignProductData={setAssignProductData}
        employeeList={employeeList}
        setAssignInput={setAssignInput}
        assignInput={assignInput}
        employee={authUserState.user}
        loading={loading}
        loadingText="Assigning..."
        setLoading={setLoading}
      />

      <ModalWraper
        show={showUpdateProductModal}
        onHide={() => setShowUpdateProductModal(false)}
        centered
        title={
          productInfoInput?.id
            ? `${productInfoInput?.product_name}`
            : "Add new product"
        }
      >
        <div className="w-full">
          <Form
            className="flex flex-col gap-4"
            onSubmit={
              productInfoInput?.update
                ? updateProductSubmit
                : createProductSubmit
            }
          >
            {!productInfoInput?.update && (
              <Select
                onChange={(e) => {
                  setProductInfoInput({
                    ...productInfoInput,
                    product_name: e.value,
                  });
                }}
                options={options}
                required
              />
            )}
            {/* {!productInfoInput?.update && (
              <Form.Select
                aria-label="Default select example"
                onChange={(e) =>
                  setProductInfoInput({
                    ...productInfoInput,
                    product_name: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Product</option>
                {productList?.map((product) => {
                  return (
                    <option key={product?.id} value={product?.name}>
                      {product?.name}
                    </option>
                  );
                })}
              </Form.Select>
            )} */}

            <LabelInput
              label="Product Quantity"
              step="0.01"
              type="number"
              value={productInfoInput?.quantity}
              controlId="quantity"
              title={` You can select upto ${productInfoInput?.quantity} Quantity`}
              name="quantity"
              min="0.1"
              placeholder={` Type Quantity `}
              onChange={(e) =>
                setProductInfoInput({
                  ...productInfoInput,
                  quantity: e.target.value,
                })
              }
              required={true}
            />

            <Loadingbutton
              isLoading={loading}
              title="Submit"
              loadingText={
                productInfoInput?.update
                  ? "Updating Product..."
                  : "Creating Product..."
              }
              type="submit"
            />

            {/* <Button type="submit">Submit</Button> */}
          </Form>
        </div>
      </ModalWraper>

      <div className=" lg:container h-screen flex flex-col items-center max-w-full  mx-auto">
        <div className="mt-8 font-bold mb-8 text-center text-blue-400">
          <ButtonGroup className="mb-2 gap-3 border w-full md:w-auto border-gray-200 p-3 ">
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                className={`!flex !justify-center !items-center custom-toggle-btn !p-1 sm:!p-3 !text-sm ${
                  radioValue === radio.value ? "btn-blue" : "btn-white"
                } toggle-button `}
                name="radio"
                value={radio.value}
                checked={radioValue === radio.value}
                onChange={(e) => {
                  setRadioValue(e.currentTarget.value);
                }}
                onClick={() => radio.data && radio.data()}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>

          <div className="flex items-center gap-x-1 md:gap-x-2">
            <div className="flex items-center gap-x-2 flex-1 relative">
              <Form.Control
                placeholder="Search Product Name here"
                aria-label="Search Product Name here"
                className="pr-4!"
                value={productSearchInput[radioValue]}
                onChange={(event) => {
                  setProductSearchInput((pre) => ({
                    ...pre,
                    [radioValue]: event.target.value,
                  }));
                }}
              />
              <span className="absolute right-4 pointer-events-none ">
                &#x1F50D;
              </span>
            </div>

            <div>
              <Button
                onClick={() => {
                  getProducts();
                  setShowUpdateProductModal(true);
                  setProductInfoInput({
                    ...productInfoInput,
                    update: false,
                  });
                }}
                className="truncate rounded-full !text-sm md:!text-base"
              >
                Add Product
              </Button>
            </div>
          </div>
        </div>

        {radioValue === "companyInventory" &&
          (filterInventory || []).length > 0 && (
            <CompanyInvTable
              inventoryList={filterInventory}
              userProfile={authUserState}
              onAssign={onAssign}
              onComInvUpdate={onComInvUpdate}
              onDelete={deleteSubmit}
              productSearchInput={productSearchInput}
            />
            // <Table bordered hover responsive className="w-full mt-4 text-center">
            //   <thead>
            //     <tr>
            //       <th>Product </th>
            //       <th>Product Type </th>
            //       <th>Available Inv.</th>
            //       <th>Replenish Inv.</th>
            //       <th>Assign</th>
            //       <th className="flex justify-center items-center min-w-[11rem] md:w-auto"></th>
            //     </tr>
            //   </thead>
            //   <tbody>
            //     {filterInventory &&
            //       filterInventory
            //         ?.filter((data) => {
            //           return data?.product?.name
            //             ?.toLowerCase()
            //             .includes(
            //               productSearchInput[radioValue]?.toLocaleLowerCase()
            //             );
            //         })
            //         ?.map((data) => {
            //           return (
            //             <tr key={data?.product?.id}>
            //               <td className="align-middle">
            //                 <div className="flex flex-col  gap-2">
            //                   <span>{data?.product?.name} </span>
            //                   {/* <span>Product Name: Product </span> */}
            //                 </div>
            //               </td>
            //               <td className="align-middle">
            //                 <div className="flex flex-col  gap-2">
            //                   <span>{data?.product?.product_type} </span>
            //                 </div>
            //               </td>

            //               <td className="align-middle">
            //                 <div className="flex flex-col  gap-2">
            //                   <span>{data?.quantity}</span>
            //                 </div>
            //               </td>

            //               <td className="align-middle">
            //                 <div className="flex flex-col  gap-2">
            //                   <span>{data?.replenish_total_inventory} </span>
            //                 </div>
            //               </td>

            //               <td className="align-middle">
            //                 <Button
            //                   variant="info"
            //                   onClick={() => {
            //                     getEmployees(true);
            //                     setAssignProductData(data);
            //                     setShowAssignMadal(true);
            //                   }}
            //                 >
            //                   Assign
            //                 </Button>
            //               </td>

            //               <td className="align-middle flex  justify-around items-center">
            //                 <Button
            //                   variant="info"
            //                   onClick={() => {
            //                     setProductInfoInput({
            //                       update: true,
            //                       quantity: data.quantity,
            //                       product_type: data?.product?.product_type,
            //                       product_name: data?.product?.name,
            //                       id: data?.product?.id,
            //                       maxQty: data?.quantity,
            //                     });
            //                     setShowUpdateProductModal(true);
            //                   }}
            //                   title="Edit Product"
            //                 >
            //                   Update
            //                 </Button>

            //                 <Button
            //                   variant="danger"
            //                   onClick={() => {
            //                     deleteSubmit(data);
            //                   }}
            //                   title="Delete Product"
            //                 >
            //                   Delete
            //                 </Button>
            //               </td>
            //             </tr>
            //           );
            //         })}
            //   </tbody>
            // </Table>
          )}

        {radioValue === "empInventories" && (
          <div className="w-full">
            {Object.keys(totalEmpInventory)
              ?.filter((data) => {
                return data
                  ?.toLowerCase()
                  .includes(
                    productSearchInput[radioValue]?.toLocaleLowerCase()
                  );
              })
              .map((productName, i) => (
                <div key={i}>
                  <h1 className="text-xl ml-2 mb-0">
                    {productName || " Not Given"}
                  </h1>
                  <Table
                    bordered
                    hover
                    responsive
                    className="w-full text-center"
                  >
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Total Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalEmpInventory[productName]?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.employee_name || "Not Given"}</td>
                          <td>{item.total_quantity.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
          </div>
        )}

        {radioValue === "inventoryRequest" &&
          requestedInventoryData?.filter((request) => !request?.is_approved)
            ?.length > 0 &&
          (authUserState.user?.is_inv_manager ||
            authUserState.user?.is_admin) && (
            <div className="px-4">
              <ul className=" container mx-auto text-lg pl-0 px-4   font-medium text-gray-900 bg-white border border-gray-200 rounded-lg ">
                {requestedInventoryData
                  ?.filter((request) => !request?.is_approved)
                  ?.filter((data) => {
                    // If authUserState.user.has_access_only_to is "all", show all items
                    if (authUserState.user?.has_access_only_to === "all") {
                      return true;
                    }
                    // If authUserState.user.has_access_only_to is not "all",
                    // show items with matching product_type
                    return authUserState.user?.has_access_only_to?.includes(
                      data?.inventory?.product?.product_type
                    );
                  })
                  ?.filter((data) => {
                    return data?.inventory?.product?.name
                      ?.toLowerCase()
                      .includes(
                        productSearchInput[radioValue]?.toLocaleLowerCase()
                      );
                  })
                  .map((data, i) => {
                    return (
                      <li
                        key={i}
                        className="w-full px-4 py-2 border-gray-200 rounded-t-lg dark:border-gray-600"
                      >
                        <span className="text-red-500/75 mr-2 text-xl ">
                          {i + 1}.
                        </span>
                        <span className="text-blue-700 mx-2">
                          {data?.requestor?.name}
                        </span>
                        has asked for
                        <span className="text-blue-700 mx-2">
                          {data?.quantity_asked} Quantity of{" "}
                          {data?.inventory?.product?.name}.
                        </span>
                        Date Needed:
                        <span className="text-blue-700 mx-2">
                          {new Date(data?.date_of_use)?.toLocaleDateString()}.
                        </span>
                        <Button
                          onClick={() => acceptRequestInventorySubmit(data)}
                          className="text-blue-700 mx-2 cursor-pointer hover:text-blue-900"
                          title="Click To Accept this Requested Inventory"
                        >
                          Fulfill
                        </Button>
                        <Button
                          onClick={() => rejectRequestInventorySubmit(data)}
                          className="text-blue-700 mx-2 cursor-pointer hover:text-blue-900"
                          title="Click To Reject this Requested Inventory"
                          variant="danger"
                        >
                          Deny
                        </Button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

        {radioValue === "products" && (
          <ProductsTab
            productSearchInput={productSearchInput}
            setProductSearchInput={setProductSearchInput}
          />
        )}
      </div>
    </>
  );
};

export default Inventory;
