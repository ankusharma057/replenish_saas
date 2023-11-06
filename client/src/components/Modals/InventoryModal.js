import { useEffect, useState, memo } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import { getInventoryList, updateEmployeeInv } from "../../Server";
import DataFilterService from "../../services/DataFilterService";
import ModalWraper from "./ModalWraper";
import Loadingbutton from "../Buttons/Loadingbutton";

const InventoryModal = ({
  showModal,
  setshowModal,
  inventoryList,
  invList,
  productList,
  // entireInventoryList,
  getEmployees,
  userProfile,
}) => {
  // for each employee invetory
  const dataList = inventoryList?.employees_inventories || invList;
  const initialNewProduct = {
    product_name: "",
    quantity: 0,
    id: 0,
    maxquantity: 0,
  };
  const [loading, setLoading] = useState(false);

  const [isUpdate, setIsUpdate] = useState(false);
  const [updatedList, setUpdatedList] = useState([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newProduct, setNewProduct] = useState(initialNewProduct);
  const [newProductArr, setnewProductArr] = useState([]);
  const [entireInventoryList, setEntireInventoryList] = useState([]);
  const [filtereDataList, setFiltereDataList] = useState([]);
  const [isAlert, setIsAlert] = useState({
    maxQuantityAlert: false,
    message: "",
  });

  const filterData = (deleteProduct) => {
    setFiltereDataList((pre) => {
      let removedProduct = pre?.length ? pre : dataList;
      if (deleteProduct) {
        removedProduct = removedProduct?.filter((product) => {
          return product.product?.id !== deleteProduct;
        });
      }
      return DataFilterService.specialInvManeger(
        removedProduct,
        userProfile?.has_access_only_to,
        userProfile?.is_admin
      );
    });
  };

  const getInventory = async (refetch = false) => {
    try {
      const { data } = await getInventoryList(refetch);
      const filterInventoryList = DataFilterService.specialInvManeger(
        data,
        userProfile?.has_access_only_to,
        userProfile?.is_admin
      );

      setEntireInventoryList(filterInventoryList);
      // setInventoryList(data);
    } catch (error) {
      console.log(error);
      // handle error
    }
  };

  useEffect(() => {
    filterData();
    getInventory();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProduct = (e) => {
    e.preventDefault();
    setnewProductArr([
      ...newProductArr,
      {
        ...newProduct,
        id: Date.now(),
      },
    ]);
    setNewProduct(initialNewProduct);
    setShowAddNew(false);
  };

  const updateNewProduct = (data) => {
    setNewProduct(data);
    setIsUpdate(true);
    setShowAddNew(true);
    deleteAddProduct(data.id);
  };

  const deleteAddProduct = (id) => {
    setnewProductArr(newProductArr.filter((data) => data.id !== id));
  };

  const checkQuantityErrors = (updated_products) => {
    const a = Object.keys(updated_products).find(
      (key) =>
        updated_products[key]?.maxQuantity <
        Number(updated_products[key]?.quantity)
    );

    return a;
  };

  const updateSubmit = () => {
    // Create a copy of the original object
    const modifiedObject = { ...updatedList };
    const getIsMaxError = checkQuantityErrors(modifiedObject);
    if (getIsMaxError) {
      const product_name = modifiedObject[getIsMaxError]?.product_name;
      const productMaxQuantity = modifiedObject[getIsMaxError]?.maxQuantity;
      setIsAlert({
        maxQuantityAlert: true,
        message: `You can select upto  ${productMaxQuantity} for product ${product_name}  `,
        productId: getIsMaxError,
      });

      return;
    }
    // Remove the "employee_id" field from the copied object
    delete modifiedObject?.employee_id;
    let updatedProductData = {
      updated_products: modifiedObject,
      new_products: newProductArr,
      employee_id: inventoryList?.id,
    };
    let totalZeroProduct = 0;

    for (const key in updatedProductData?.updated_products) {
      if (updatedProductData?.updated_products[key]?.quantity <= 0) {
        totalZeroProduct = totalZeroProduct + 1;
      }
    }

    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure, you want to delete ${String(
        totalZeroProduct
      )}, update ${
        Object.keys(updatedProductData.updated_products)?.length -
        totalZeroProduct
      } product(s), and add ${
        updatedProductData.new_products?.length
      } product(s). `,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            setLoading(true);
            try {
              await updateEmployeeInv(updatedProductData);
              toast.success(" Updated successfully.");
              await getInventory(true);
              await getEmployees(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to Update "
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleQuantityChange = (e, invData, maxQuantity) => {
    setIsAlert({
      maxQuantityAlert: false,
    });
    setUpdatedList({
      ...updatedList,
      employee_id: invData?.employee?.id,
      [invData?.product?.id]: {
        quantity: e.target.value,
        maxQuantity,
        product_name: invData?.product?.name,
      },
    });
  };

  const deleteOldProduct = (data) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to delete the product ${data.product?.name} `,
      buttons: [
        {
          label: "Yes",

          onClick: () => {
            filterData(data.product.id);
            setUpdatedList({
              ...updatedList,
              employee_id: data?.employee?.id,
              [data?.product?.id]: {
                quantity: 0,
                maxQuantity: 0,
                product_name: data?.product?.name,
              },
            });
            setIsUpdate(true);
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
      <ModalWraper
        show={showModal}
        onHide={() => {
          setIsUpdate(false);
          setshowModal(false);
        }}
        centered
        title={inventoryList?.name}
        footer={
          isUpdate ? (
            <Loadingbutton
              isLoading={loading}
              title="Update"
              loadingText={"Updating..."}
              type="button"
              onClick={updateSubmit}
            />
          ) : null
        }
      >
        <div>
          <Table bordered hover responsive className="w-full text-center">
            <thead>
              <tr>
                <th className="w-1/2">Product </th>
                <th>Quantity</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filtereDataList?.map((data) => {
                return (
                  <tr key={data?.product?.id}>
                    <td className="align-middle">
                      <div className="flex flex-col  gap-2">
                        <div className="flex flex-col justify-center gap-2">
                          <span>
                            <span>{data?.product?.name} </span>
                          </span>
                        </div>

                        {isAlert.maxQuantityAlert &&
                          String(isAlert?.productId) ===
                            String(data?.product?.id) && (
                            <span className="text-sm block text-red-400 -mt-2 mb-2">
                              {isAlert?.message}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="align-middle">
                      {isUpdate ? (
                        <Form className="flex flex-col gap-4">
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step=".01"
                            defaultValue={data?.quantity.toFixed(2)}
                            onChange={(e) => {
                              const findInventory = entireInventoryList.find(
                                (envData) => {
                                  return (
                                    data?.product?.id === envData?.product?.id
                                  );
                                }
                              );
                              const maxQuantity =
                                Number(findInventory?.quantity) +
                                Number(data?.quantity);
                              handleQuantityChange(e, data, maxQuantity);
                            }}
                            min={0}
                            required
                          />
                        </Form>
                      ) : (
                        <div className="flex flex-col justify-center gap-2">
                          <span>{parseFloat(data?.quantity).toFixed(2)} </span>
                        </div>
                      )}
                    </td>
                    <td className="align-middle flex gap-2">
                      <div
                        onClick={() => {
                          setIsUpdate(true);
                        }}
                        className="px-3 text-2xl text-white cursor-pointer font-bold rounded-md bg-blue-400"
                      >
                        -
                      </div>
                      <div
                        onClick={() => {
                          deleteOldProduct(data);
                        }}
                        className="px-3 text-2xl text-white cursor-pointer font-bold rounded-md bg-red-400"
                      >
                        X
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {newProductArr?.length > 0 && (
            <Table bordered hover responsive className="w-full text-center">
              <thead>
                <tr>
                  <th className="w-1/2">Product </th>
                  <th className="w-[30%]">Quantity</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {newProductArr?.map((product) => {
                  return (
                    <tr key={product.id}>
                      <td className="align-middle">
                        <div className="flex flex-col  gap-2">
                          <div className="flex flex-col justify-center gap-2">
                            <span>
                              <span>{product?.product_name} </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="flex flex-col justify-center gap-2">
                          <span>{product?.quantity}</span>
                        </div>
                      </td>

                      <td className="align-middle">
                        <div className="flex gap-2 ">
                          <div
                            onClick={() => {
                              updateNewProduct(product);
                            }}
                            className="px-3 text-2xl text-white cursor-pointer font-bold rounded-md bg-blue-400"
                          >
                            -
                          </div>
                          <div
                            onClick={() => {
                              deleteAddProduct(product.id);
                            }}
                            className="px-3 text-xl text-red-500 cursor-pointer font-bold rounded-md bg-blue-400"
                          >
                            x
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          {showAddNew ? (
            <Form
              className="w-full flex flex-col md:flex-row  gap-2 text-center mb-2"
              onSubmit={saveProduct}
            >
              <div className=" md:w-2/4">
                <Form.Select
                  aria-label="Default select example"
                  onChange={(e) => {
                    const selectedMaxQuantity =
                      e.target.selectedOptions[0].getAttribute("maxquantity");

                    setNewProduct({
                      ...newProduct,
                      product_name: e.target.value,
                      maxquantity: Number(selectedMaxQuantity),
                    });
                  }}
                  value={newProduct?.product_name}
                  required
                >
                  <option value="">Select Product</option>
                  {entireInventoryList
                    ?.filter(
                      (item1) =>
                        !newProductArr.some(
                          (item2) =>
                            item2?.product_name === item1?.product?.name
                        )
                    )
                    ?.filter(
                      (item1) =>
                        !dataList.some(
                          (item2) =>
                            item2?.product?.name === item1?.product?.name
                        )
                    )
                    ?.map((product) => {
                      return (
                        <option
                          key={product?.id}
                          value={product?.product?.name}
                          maxquantity={product?.quantity}
                        >
                          {product?.product?.name}
                        </option>
                      );
                    })}
                </Form.Select>
              </div>
              <div className="md:w-2/4 flex justify-between gap-2">
                <Form.Control
                  type="number"
                  step="0.01"
                  onWheel={(e) => e.target.blur()}
                  className="w-[80%]"
                  placeholder={`${
                    newProduct?.maxquantity !== undefined &&
                    newProduct?.maxquantity !== null
                      ? `Quantity. max ${newProduct?.maxquantity || 0}`
                      : `Select the product first`
                  }`}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      quantity: e.target.value,
                    });
                  }}
                  value={newProduct.quantity}
                  min={0.1}
                  max={newProduct?.maxquantity}
                  required
                />
                <div className="w-[20%] text-right ">
                  <Button type="submit" className="text-white text-2xl">
                    &#x2713;
                  </Button>
                </div>
              </div>
            </Form>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                setIsUpdate(true);
                setShowAddNew(true);
              }}
            >
              Add New
            </Button>
          )}
        </div>
      </ModalWraper>
    </>
  );
};

export default memo(InventoryModal);
