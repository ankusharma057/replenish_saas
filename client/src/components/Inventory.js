import React, { useEffect, useState } from "react";
import Header from "./Header";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, Card, Modal, Table, Form } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert"; // Import
import AssignModal from "./AssignModal";

const Inventory = ({
  userProfile,
  employeeList,
  productList,
  inventoryList,
}) => {
  const navigate = useNavigate();
  const [showModal, setshowModal] = useState(false);
  const [productInfoInput, setproductInfoInput] = useState({});
  const [updateQtyInput, setUpdateQtyInput] = useState({});
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
  const [showAssignMadal, setShowAssignMadal] = useState(false);
  const [assignProductData, setAssignProductData] = useState({});
  const [assignInput, setAssignInput] = useState({
    quantity: 0,
  });

  const [showTotalEmpInventory, setShowTotalEmpInventory] = useState(false);
  const [totalEmpInventory, settotalEmpInventory] = useState({});
  const [totalEmpInventorySearchInput, settotalEmpInventorySearchInput] =
    useState("");

  const [filterInventory, setFilterInventory] = useState([]);

  const [searchInput, setSearchInput] = useState("");

  const [requestedInventoryData, setRequestedInventoryData] = useState([]);

  console.log({ inventoryList });
  useEffect(() => {
    if (userProfile?.is_admin) {
      setFilterInventory(inventoryList);
      return;
    } else {
      if (userProfile?.is_inv_manager) {
        if (!(userProfile.has_access_only_to === "all")) {
          const filteredProducts = inventoryList?.filter((item) =>
            userProfile?.has_access_only_to?.includes(
              item?.product?.product_type
            )
          );
          setFilterInventory(filteredProducts);
        } else {
          setFilterInventory(inventoryList);
        }
      }
    }
    return () => {};
  }, [
    inventoryList,
    userProfile.has_access_only_to,
    userProfile?.is_admin,
    userProfile?.is_inv_manager,
  ]);

  useEffect(() => {
    fetch("/api/inventory_requests")
      .then((r) => r.json())
      .then((data) => {
        setRequestedInventoryData(data);
      });
  }, []);

  const deleteSubmit = (inventory) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to delete ${inventory?.product?.name} `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventories/${inventory?.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((res) => {
                if (res.ok) {
                  toast.success(
                    `${inventory?.product?.name} Deleted Successfully.`
                  );
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                } else if (res.status === 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to Delete the Inventory.");
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
            fetch(`/api/inventory_requests/${data?.id}/accept`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
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
                    toast.error(
                      "You do not have enough Available Inventory for this product "
                    );
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
            fetch(`/api/inventory_requests/${data?.id}/reject`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((res) => {
                if (res.ok) {
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

  const convertData = (data) => {
    const result = {};

    console.log({ employeeList });
    // Loop through the data
    data?.forEach((employee) => {
      // Loop through each employee's inventories
      employee.employees_inventories?.forEach((inventory) => {
        // Check if the product type matches userProfile.has_access_only_to
        const productTypeMatches =
          userProfile?.has_access_only_to === "all" ||
          inventory?.product?.product_type === userProfile.has_access_only_to;

        // Continue processing only if the product type matches
        if (productTypeMatches) {
          // Check if the product is already in the result
          if (!result[inventory?.product?.name]) {
            result[inventory?.product?.name] = [];
          }

          // Check if the employee is already in the product's array
          const existingEmployee = result[inventory?.product?.name].find(
            (item) => item?.employee_name === employee?.name
          );

          // If the employee is not in the array, add them with quantity
          if (!existingEmployee) {
            result[inventory?.product?.name].push({
              employee_name: employee?.name,
              total_quantity: inventory?.quantity,
            });
          } else {
            // If the employee is already in the array, update the quantity
            existingEmployee.total_quantity += inventory?.quantity;
          }
        }
      });
    });

    return result;
  };

  const filteredInventoryList =
    userProfile.has_access_only_to === "all"
      ? productList
      : productList &&
        productList?.filter((inventory) => {
          return inventory?.product_type === userProfile.has_access_only_to;
        });

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

      <Modal
        show={showTotalEmpInventory}
        onHide={() => setShowTotalEmpInventory(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Empoyees Inventory
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex justify-between flex-col items-center gap-2  overflow-y-auto pb-4">
          <Form.Control
            className="w-full"
            type="email"
            placeholder="Seach Product"
            onChange={(e) => settotalEmpInventorySearchInput(e.target.value)}
          />
          <div className="w-full max-h-[30rem]">
            {Object.keys(totalEmpInventory)
              ?.filter((data) => {
                return data
                  ?.toLowerCase()
                  .includes(totalEmpInventorySearchInput?.toLocaleLowerCase());
              })
              .map((productName) => (
                <div key={productName}>
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
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowTotalEmpInventory(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      {requestedInventoryData?.filter((request) => !request?.is_approved)
        ?.length > 0 &&
        (userProfile?.is_inv_manager || userProfile?.is_admin) && (
          <div className="px-4">
            <h2 className="text-4xl mt-8 font-bold text-center text-blue-400">
              Inventory Request
            </h2>
            <ul className=" container  mx-auto text-lg pl-0 px-4   font-medium text-gray-900 bg-white border border-gray-200 rounded-lg ">
              {requestedInventoryData
                ?.filter((request) => !request?.is_approved)
                ?.filter((data) => {
                  // If userProfile.has_access_only_to is "all", show all items
                  if (userProfile.has_access_only_to === "all") {
                    return true;
                  }
                  // If userProfile.has_access_only_to is not "all",
                  // show items with matching product_type
                  return (
                    data?.inventory?.product?.product_type ===
                    userProfile.has_access_only_to
                  );
                })
                .map((data) => {
                  return (
                    <li className="w-full px-4 py-2 border-gray-200 rounded-t-lg dark:border-gray-600">
                      <span className="text-red-500 text-xl ">*</span>
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

      <Modal
        show={showUpdateProductModal}
        onHide={() => setShowUpdateProductModal(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {productInfoInput?.id
              ? `Product Id: ${productInfoInput?.id}`
              : "Add new product"}
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
                >
                  <option>Select Product</option>
                  {filteredInventoryList?.map((product) => {
                    return (
                      <option key={product?.id} value={product?.name}>
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
                step="0.01"
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
                min={0}
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
          <Button
            onClick={() => {
              settotalEmpInventory(convertData(employeeList));
              setShowTotalEmpInventory(true);
            }}
            className="self-end inline"
          >
            Emp Inventories
          </Button>
        </div>
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
