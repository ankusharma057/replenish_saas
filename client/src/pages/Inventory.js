import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Table, Form, InputGroup } from "react-bootstrap";
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

const Inventory = () => {
  const { authUserState } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [productInfoInput, setproductInfoInput] = useState({});
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
  const [showAssignMadal, setShowAssignMadal] = useState(false);
  const [assignProductData, setAssignProductData] = useState({});
  const [assignInput, setAssignInput] = useState({
    quantity: 0,
  });

  const [productList, setProductList] = useState([]);

  const [employeeList, setEmployeeList] = useState([]);
  const [totalEmpInventory, settotalEmpInventory] = useState({});

  const [radioValue, setRadioValue] = useState("1");

  const [filterInventory, setFilterInventory] = useState([]);

  const [productSearchInput, setProductSearchInput] = useState({
    1: "",
    2: "",
    3: "",
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
              toast.success("Product Updated Successfully.");
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

  const radios = [
    { name: "Company Inventory", value: "1" },
    {
      name: "Emp Inventories",
      value: "2",
      data: getEmployees,
    },
    {
      name: "Inventory Request ",
      value: "3",
      data: getRequestInventoryData,
    },
  ];

  return (
    <>
      {/* <Header userProfile={authUserState.user} /> */}
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
              <Form.Select
                aria-label="Default select example"
                onChange={(e) =>
                  setproductInfoInput({
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
            )}

            <LabelInput
              label="Product Quantity"
              step="0.01"
              type="number"
              value={productInfoInput?.quantity}
              controlId="quantity"
              title={` You can select upto ${productInfoInput?.quantity} Quantity`}
              name="quantity"
              placeholder={` Type Quantity `}
              onChange={(e) =>
                setproductInfoInput({
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

      <div className=" container  mx-auto">
        <div className="text-4xl mt-8 font-bold text-center text-blue-400">
          <ButtonGroup className="mb-2 gap-3 border w-full md:w-auto border-gray-200 p-3 ">
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                className={` custom-toggle-btn ${
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
        </div>
        <div className="flex mt-2 justify-center">
          <div className="w-[52.5rem]">
            <InputGroup className="mb-3 ">
              <Form.Control
                placeholder="Search Product Name here"
                aria-label="Search Product Name here"
                aria-describedby="basic-addon2"
                value={productSearchInput[radioValue]}
                onChange={(event) => {
                  setProductSearchInput((pre) => ({
                    ...pre,
                    [radioValue]: event.target.value,
                  }));
                }}
              />
              <InputGroup.Text id="basic-addon2">&#x1F50D;</InputGroup.Text>
            </InputGroup>
          </div>
        </div>
        {radioValue === "1" && (
          <Table bordered hover responsive className="w-full mt-4 text-center">
            <thead>
              <tr>
                <th>Product </th>
                <th>Product Type </th>
                <th>Available Inv.</th>
                <th>Replenish Inv.</th>
                <th>Assign</th>
                <th className="flex justify-center items-center min-w-[11rem] md:w-auto"></th>
              </tr>
            </thead>
            <tbody>
              {filterInventory &&
                filterInventory
                  ?.filter((data) => {
                    return data?.product?.name
                      ?.toLowerCase()
                      .includes(
                        productSearchInput[radioValue]?.toLocaleLowerCase()
                      );
                  })
                  ?.map((data) => {
                    return (
                      <tr key={data?.product?.id}>
                        <td className="align-middle">
                          <div className="flex flex-col  gap-2">
                            <span>{data?.product?.name} </span>
                            {/* <span>Product Name: Product </span> */}
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="flex flex-col  gap-2">
                            <span>{data?.product?.product_type} </span>
                          </div>
                        </td>

                        <td className="align-middle">
                          <div className="flex flex-col  gap-2">
                            <span>{data?.quantity}</span>
                          </div>
                        </td>

                        <td className="align-middle">
                          <div className="flex flex-col  gap-2">
                            <span>{data?.replenish_total_inventory} </span>
                          </div>
                        </td>

                        <td className="align-middle">
                          <Button
                            variant="info"
                            onClick={() => {
                              getEmployees(true);
                              setAssignProductData(data);
                              setShowAssignMadal(true);
                            }}
                          >
                            Assign
                          </Button>
                        </td>

                        <td className="align-middle flex  justify-around items-center">
                          <Button
                            variant="info"
                            onClick={() => {
                              setproductInfoInput({
                                update: true,
                                quantity: data.quantity,
                                product_type: data?.product?.product_type,
                                product_name: data?.product?.name,
                                id: data?.product?.id,
                                maxQty: data?.quantity,
                              });
                              setShowUpdateProductModal(true);
                            }}
                            title="Edit Product"
                          >
                            Update
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => {
                              deleteSubmit(data);
                            }}
                            title="Delete Product"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </Table>
        )}

        {radioValue === "1" && (
          <div
            className="my-10 container cursor-pointer mx-auto"
            onClick={() => {
              getProducts();
              setShowUpdateProductModal(true);
              setproductInfoInput({
                ...productInfoInput,
                update: false,
              });
            }}
          >
            <div className="flex rounded-full items-center justify-start ">
              <p
                title="Add Product"
                className="text-2xl w-10 h-10 p-4  hover:bg-blue-500  bg-blue-400 flex rounded-full items-center justify-center  "
              >
                +
              </p>
            </div>
          </div>
        )}
        {radioValue === "2" && (
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

        {radioValue === "3" &&
          requestedInventoryData?.filter((request) => !request?.is_approved)
            ?.length > 0 &&
          (authUserState.user?.is_inv_manager ||
            authUserState.user?.is_admin) && (
            <div className="px-4">
              <ul className=" container  mx-auto text-lg pl-0 px-4   font-medium text-gray-900 bg-white border border-gray-200 rounded-lg ">
                {requestedInventoryData
                  ?.filter((request) => !request?.is_approved)
                  ?.filter((data) => {
                    // If authUserState.user.has_access_only_to is "all", show all items
                    if (authUserState.user?.has_access_only_to === "all") {
                      return true;
                    }
                    // If authUserState.user.has_access_only_to is not "all",
                    // show items with matching product_type
                    return (
                      data?.inventory?.product?.product_type ===
                      authUserState.user?.has_access_only_to
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
      </div>
    </>
  );
};

export default Inventory;
