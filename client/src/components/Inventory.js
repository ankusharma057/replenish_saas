import React, { useEffect, useState } from "react";
import Header from "./Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, Card, Modal, Table, Form } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert"; // Import
import AssignModal from "./AssignModal";

const Inventory = ({ userProfile, employeeList, productList }) => {
  const navigate = useNavigate();
  const [showModal, setshowModal] = useState(false);
  const [productInfoInput, setproductInfoInput] = useState({});
  const [updateQtyInput, setUpdateQtyInput] = useState({});
  const [entireInventory, setEntireInventory] = useState([]);
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);

  const [showAssignMadal, setShowAssignMadal] = useState(false);
  const [assignProductData, setAssignProductData] = useState({});
  const [assignInput, setAssignInput] = useState({
    quantity: 0,
  });

  const [searchInput, setSearchInput] = useState("");

  const [requestedInventoryData, setRequestedInventoryData] = useState([]);

  useEffect(() => {
    fetch("/api/inventories")
      .then((r) => r.json())
      .then((data) => {
        setEntireInventory(data);
      });
  }, []);

  useEffect(() => {
    fetch("/api/inventory_requests")
      .then((r) => r.json())
      .then((data) => {
        setRequestedInventoryData(data);
      });
  }, []);

  const deleteSubmit = (product) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to delete ${product?.name} `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventories/${product?.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((res) => {
                if (res.ok) {
                  toast.success("Updated Product Quantity Successfully.");
                  window.location.reload();
                } else if (res.status == 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to Update the Product Quantity");
                  });
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                toast.error("An error occured.");
              });
            //  fetch("employees/" + employee.id + "/send_reset_password_link");
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
    console.log({ productInfoInput });
    setShowUpdateProductModal(false);

    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to Update Quantity for ${productInfoInput.name} `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventories/${productInfoInput?.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(productInfoInput),
            })
              .then((res) => {
                if (res.ok) {
                  toast.success("Product Updated Successfully.");
                  window.location.reload();
                } else if (res.status == 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to Update the Product ");
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
            setShowUpdateProductModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };

  const createProductSubmit = (e) => {
    e.preventDefault();
    console.log({ productInfoInput });
    setShowUpdateProductModal(false);

    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to Create/Update Inventory for ${productInfoInput.product_name} `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventories`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(productInfoInput),
            })
              .then((res) => {
                if (res.ok) {
                  toast.success(" Product Created  Successfully.");
                  window.location.reload();
                } else if (res.status == 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to Create the Product ");
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
            setShowUpdateProductModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };

  const assignSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...assignInput,
      product_name: assignProductData?.product?.name,
    };

    fetch(`/api/inventories/${assignProductData?.id}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...productData }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success(
            userProfile.is_admin
              ? "Assigned the Inventory to the Employee"
              : "Prompted Employee for the inventory."
          );
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (res.status == 404) {
          res.json().then((json) => {
            toast.error("Please provide a client.");
          });
        } else {
          res.json().then((json) => {
            toast.error("Failed to assign the inventory.");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occured.");
      });
  };

  const acceptRequestInventorySubmit = (data) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to Accept Invetory `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventory_requests`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            })
              .then((res) => {
                if (res.ok) {
                  toast.success("You have accept this inventory Successfully.");
                  window.location.reload();
                } else if (res.status === 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to Accept the Inventory ");
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
            //  setShowUpdateProductModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };

  const rejectRequestInventorySubmit = (data) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to Reject Invetory `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventory_requests`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            })
              .then((res) => {
                if (res.ok) {
                  toast.success(
                    "You have rejected this inventory Successfully."
                  );
                  window.location.reload();
                } else if (res.status === 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to Reject the Inventory ");
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
            //  setShowUpdateProductModal(true);
            console.log("Click No");
          },
        },
      ],
    });
  };

  return (
    <>
      <Header userProfile={userProfile} />
      <AssignModal
        showAssignMadal={showAssignMadal}
        setShowAssignMadal={setShowAssignMadal}
        assignSubmit={assignSubmit}
        assignProductData={assignProductData}
        setAssignProductData={setAssignProductData}
        employeeList={employeeList}
        setAssignInput={setAssignInput}
        assignInput={assignInput}
        employee={userProfile}
      />
      {requestedInventoryData?.length > 0 &&
        (userProfile?.is_inv_manager || userProfile?.is_admin) && (
          <Table bordered hover responsive className="w-full mt-4 text-center">
            <thead>
              <tr>
                <th>Employee Name </th>
                <th>Product </th>
                <th>Quantity </th>
                <th>Date</th>
                <th className="flex justify-center items-center min-w-[11rem] md:w-auto"></th>
              </tr>
            </thead>
            <tbody>
              {requestedInventoryData?.map((data) => {
                return (
                  <tr key={data?.product?.id}>
                    <td className="align-middle">
                      <div className="flex flex-col  gap-2">
                        <span>{data?.product?.name} </span>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="flex flex-col  gap-2">
                        <span>{data?.product?.product_type} </span>
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="flex flex-col   gap-2">
                        <span>{data?.quantity} </span>
                      </div>
                    </td>
                    <td className="align-middle">
                      <Button
                        variant="info"
                        onClick={() => {
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
                        onClick={() => acceptRequestInventorySubmit(data)}
                        title="Accept Inventory Request"
                      >
                        Accept
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => {
                          rejectRequestInventorySubmit(data);
                        }}
                        title="Deny Inventory Request"
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      <Modal
        show={showUpdateProductModal}
        onHide={() => setShowUpdateProductModal(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Product Id: {productInfoInput?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex justify-between flex-col items-center gap-2">
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
                  <option>Select Product</option>
                  {productList?.map((product) => {
                    return (
                      <option key={product?.name} value={product.name}>
                        {product?.name}
                      </option>
                    );
                  })}
                </Form.Select>
              )}

              <Form.Label style={{ marginBottom: "-1rem" }}>
                Product Quantity
              </Form.Label>

              <Form.Control
                type="number"
                value={productInfoInput?.quantity}
                placeholder={` Type Quantity `}
                onChange={(e) =>
                  setproductInfoInput({
                    ...productInfoInput,
                    quantity: e.target.value,
                  })
                }
                // max={productInfoInput?.maxQty}
                title={` You can select upto ${productInfoInput?.quantity} Quantity`}
                min={1}
                required
              />

              <Button type="submit">Submit</Button>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowUpdateProductModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className=" container  mx-auto">
        <h2 className="text-4xl mt-8 font-bold text-center text-blue-400">
          Company Inventory
        </h2>
        <div className="flex justify-center">
          <input
            type="text"
            className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search Product Name here"
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <Table bordered hover responsive className="w-full mt-4 text-center">
          <thead>
            <tr>
              <th>Product </th>
              <th>Product Type </th>
              <th>Quantity</th>
              <th>Assign</th>
              <th className="flex justify-center items-center min-w-[11rem] md:w-auto"></th>
            </tr>
          </thead>
          <tbody>
            {entireInventory &&
              entireInventory
                ?.filter((data) => {
                  return data?.product?.name
                    ?.toLowerCase()
                    .includes(searchInput?.toLocaleLowerCase());
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
                        <div className="flex flex-col   gap-2">
                          <span>{data?.quantity} </span>
                        </div>
                      </td>
                      <td className="align-middle">
                        <Button
                          variant="info"
                          onClick={() => {
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
                            console.log(data);

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
                            deleteSubmit(data?.product);
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

        <div
          className="my-10 container cursor-pointer mx-auto"
          onClick={() => {
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
      </div>
    </>
  );
};

export default Inventory;
