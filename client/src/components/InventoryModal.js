import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";

const InventoryModal = ({
  showModal,
  setshowModal,
  inventoryList,
  invList,
  productList,
  entireInventoryList,
  userProfile,
}) => {
  const dataList = inventoryList?.employees_inventories || invList;
  const initialNewProduct = {
    product_name: "",
    quantity: 0,
    id: 0,
    maxquantity: 0,
  };
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({
    quantity: 0,
    product: "",
    id: "",
    maxQuantity: 0,
  });
  const [updatedList, setUpdatedList] = useState([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newProduct, setNewProduct] = useState(initialNewProduct);
  const [newProductArr, setnewProductArr] = useState([]);
  const [isAlert, setIsAlert] = useState({
    maxQuantityAlert: false,
    message: "",
  });
  // const [filtereDataList, setfiltereDataList] = useState([]);
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
          Number(updated_products[key]?.quantity) ||
        Number(updated_products[key]?.quantity) === 0
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
      const productQuantity = modifiedObject[getIsMaxError]?.quantity;

      setIsAlert({
        maxQuantityAlert: true,
        message: ` ${
          Number(productQuantity) === 0
            ? `Quantity should not be ${productQuantity}  for product ${product_name}  `
            : `You can select upto  ${productMaxQuantity} for product ${product_name}  `
        }`,

        productId: getIsMaxError,
      });

      return;
    }
    // Remove the "employee_id" field from the copied object
    setshowModal(false);
    delete modifiedObject?.employee_id;
    let updatedProductData = {
      updated_products: modifiedObject,
      new_products: newProductArr,
      employee_id: inventoryList?.id,
    };

    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure, you want to update ${
        Object.keys(updatedProductData.updated_products)?.length
      } product(s), and add ${
        updatedProductData.new_products?.length
      } product(s). `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(
              `/api/employees/${updatedProductData?.employee_id}/update_inventories`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedProductData),
              }
            )
              .then((res) => {
                if (res.ok) {
                  toast.success(" Updated successfully.");
                  window.location.reload();
                } else if (res.status === 404) {
                  res.json().then(() => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then(() => {
                    toast.error("Failed to Update ");
                  });
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                toast.error("An error occured.");
              });
          },
        },
        {
          label: "No",
          onClick: () => {
            setshowModal(true);
          },
        },
      ],
    });
  };
  const filteredInventoryList =
    userProfile.has_access_only_to === "all"
      ? entireInventoryList
      : entireInventoryList?.filter((product) => {
          return (
            product?.product?.product_type === userProfile.has_access_only_to
          );
        });

  const filtereDataList =
    userProfile.has_access_only_to === "all"
      ? dataList
      : dataList?.filter((product) => {
          return (
            product.product?.product_type === userProfile.has_access_only_to
          );
        });

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

  return (
    <Modal
      show={showModal}
      onHide={() => {
        setIsUpdate(false);
        setshowModal(false);
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {inventoryList?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center flex  flex-col gap-4">
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
                    <td className="align-middle">
                      <div
                        onClick={() => {
                          setIsUpdate(true);
                        }}
                        className="px-3 text-2xl text-white cursor-pointer font-bold rounded-md bg-blue-400"
                      >
                        -
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
                  {filteredInventoryList
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
                  className="w-[80%]"
                  placeholder={` ${
                    newProduct?.maxquantity
                      ? `Quantity. max ${newProduct?.maxquantity || 0}`
                      : `Select the product first`
                  } `}
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      quantity: e.target.value,
                    });
                  }}
                  value={newProduct.quantity}
                  min={0}
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
      </Modal.Body>
      <Modal.Footer>
        {isUpdate && <Button onClick={updateSubmit}>Update</Button>}
        <Button onClick={() => setshowModal(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InventoryModal;
