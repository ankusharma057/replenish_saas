import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import AssignModal from "./AssignModal";
import { confirmAlert } from "react-confirm-alert";

const InventoryModal = ({
  showModal,
  setshowModal,
  inventoryList,
  updateQtySubmit,
  updateQtyInput,
  setUpdateQtyInput,
  invList,
  userProfile,
  employeeList,
  productList,
}) => {
  const dataList = inventoryList?.employees_inventories || invList;
  const initialNewProduct = {
    product_name: "",
    quantity: 1,
    id: 0,
  };
  const [updateModalShow, setUpdateModalShow] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({
    quantity: 0,
    product: "",
    id: "",
  });
  const [updatedList, setUpdatedList] = useState([]);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newProduct, setNewProduct] = useState(initialNewProduct);
  const [newProductArr, setnewProductArr] = useState([]);
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
    console.log({ data, newProductArr });
    setNewProduct(data);
    setIsUpdate(true);
    setShowAddNew(true);
    deleteAddProduct(data.id);
  };
  const deleteAddProduct = (id) => {
    setnewProductArr(newProductArr.filter((data) => data.id !== id));
  };

  const updateSubmit = () => {
    setshowModal(false);
    // Create a copy of the original object
    const modifiedObject = { ...updatedList };

    // Remove the "employee_id" field from the copied object
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
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
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
              {dataList?.map((data) => {
                return (
                  <>
                    <tr key={data?.product?.id}>
                      <td className="align-middle">
                        <div className="flex flex-col  gap-2">
                          <div className="flex flex-col justify-center gap-2">
                            <span>
                              <span>{data?.product?.name} </span>
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        {isUpdate ? (
                          <Form className="flex flex-col gap-4">
                            <Form.Control
                              type="number"
                              defaultValue={data?.quantity}
                              onChange={(e) => {
                                console.log("THIS IS THE WANTED ID:", data);
                                setUpdatedList({
                                  ...updatedList,
                                  employee_id: data?.employee?.id,
                                  [data?.product?.id]: {
                                    quantity: e.target.value,
                                  },
                                });
                              }}
                              min={1}
                              required
                            />
                          </Form>
                        ) : (
                          <div className="flex flex-col justify-center gap-2">
                            <span>
                              {updateData.quantity || data?.quantity}{" "}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="align-middle">
                        {isUpdate ? (
                          <div
                            onClick={() => {
                              setIsUpdate(true);
                              setUpdateData({
                                product: data?.product?.name,
                                quantity: data?.quantity - 1,
                              });
                            }}
                            className="px-3 text-2xl text-white cursor-pointer font-bold rounded-md bg-blue-400"
                          >
                            -
                          </div>
                        ) : (
                          <div className="flex gap-4 justify-center">
                            <div
                              onClick={() => {
                                setIsUpdate(true);
                                setUpdateData({
                                  product: data?.product?.name,
                                  quantity: data?.quantity - 1,
                                });
                              }}
                              className="px-3 text-2xl text-white cursor-pointer  font-bold rounded-md  bg-blue-400"
                            >
                              -
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  </>
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
                    <>
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
                            <span>{product.quantity}</span>
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
                    </>
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
              <div className="  md:w-2/4">
                <Form.Select
                  aria-label="Default select example"
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      product_name: e.target.value,
                    })
                  }
                  value={newProduct?.product_name}
                  required
                >
                  <option value="">Select Product</option>
                  {productList
                    ?.filter(
                      (item1) =>
                        !newProductArr.some(
                          (item2) => item2?.product_name === item1?.name
                        )
                    )
                    ?.filter(
                      (item1) =>
                        !dataList.some(
                          (item2) => item2.product?.name === item1?.name
                        )
                    )
                    ?.map((product) => {
                      return (
                        <option key={product?.id} value={product?.name}>
                          {product?.name}
                        </option>
                      );
                    })}
                </Form.Select>
              </div>
              <div className="md:w-2/4 flex justify-between gap-2">
                <Form.Control
                  type="number"
                  className="w-[80%]"
                  placeholder="Add Quantity"
                  onChange={(e) => {
                    setNewProduct({
                      ...newProduct,
                      quantity: e.target.value,
                    });
                  }}
                  value={newProduct.quantity}
                  min={1}
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
