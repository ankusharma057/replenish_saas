import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import AssignModal from "./AssignModal";

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

  const [updateModalShow, setUpdateModalShow] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({
    quantity: 0,
    product: "",
    id: "",
  });
  const [updatedList, setUpdatedList] = useState([]);

  const [showAddNew, setShowAddNew] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    quantity: 0,
  });

  const updateSubmit = () => {
    fetch(`/api/employees/${updatedList?.employee_id}/update_inventories`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...updatedList, newProduct }),
    })
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
  };
  useEffect(() => {}, []);

  // useEffect(() => {
  //   for (let index = 0; index < dataList.length; index++) {
  //     const element = dataList[index].product;

  //     console.log(element);
  //   }

  //   return () => {};
  // }, []);

  // console.log(JSON.stringify(updatedList, null, 2));

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
                    <tr key={data?.product.id}>
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
                                console.log(data?.product?.id);
                                setUpdatedList({
                                  ...updatedList,
                                  employee_id: data?.employee.id,
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
          {showAddNew && (
            <Table bordered hover responsive className="w-full text-center">
              <thead>
                <tr>
                  <th className="w-1/2">Product </th>
                  <th>Quantity</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <th>
                    <Form.Select
                      aria-label="Default select example"
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          product_name: e.target.value,
                        })
                      }
                      required
                    >
                      <option>Select Product</option>
                      {productList
                        ?.filter(
                          (product) => product.name !== updateData.product
                        )
                        .map((product) => {
                          return (
                            <option key={product?.name} value={product.name}>
                              {product?.name}
                            </option>
                          );
                        })}
                    </Form.Select>
                  </th>
                  <th>
                    <Form className="flex flex-col gap-4">
                      <Form.Control
                        type="number"
                        onChange={(e) => {
                          setNewProduct({
                            ...newProduct,
                            quantity: e.target.value,
                          });
                        }}
                        min={1}
                        required
                      />
                    </Form>
                  </th>
                </tr>
              </tbody>
            </Table>
          )}
          <Button
            className="w-full"
            onClick={() => {
              setIsUpdate(true);
              setShowAddNew(true);
            }}
          >
            Add New
          </Button>
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
