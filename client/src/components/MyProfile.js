import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "./Header";
import CustomModal from "./CustomModal.js";
import { Button, Card, Modal, Form } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import AssignModal from "./AssignModal";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert"; // Import

function UserPage({ userProfile, employeeList, productList }) {
  const [employee, setEmployee] = useState();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [invoiceData, setinvoiceData] = useState(null);
  const [showAssignMadal, setShowAssignMadal] = useState(false);
  const [assignProductData, setAssignProductData] = useState({});
  const [acceptInventories, setAcceptInventories] = useState({});
  const [assignInput, setAssignInput] = useState({
    quantity: 0,
  });
  const [showRequestInvetory, setshowRequestInvetory] = useState(false);
  const [requestInvetroryInput, setRequestInvetroryInput] = useState({
    quantity: 0,
    product_name: "",
    date_of_use: "",
  });

  const otherEmployeesList = employeeList?.filter(
    (employee) => employee?.id != userProfile?.id
  );

  function handleClick(invoice) {
    setModalShow(!modalShow);
  }

  const params = useParams();
  const { id } = params;

  useEffect(() => {
    fetch(`/api/employees/${id}`).then((res) => {
      if (res.ok) {
        res.json().then((employee) => {
          setEmployee(employee);
          setLoading(false);
        });
      } else {
        res.json().then((data) => setErrors(data.error));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignSubmit = (e, data) => {
    e.preventDefault();
    const productData = {
      ...assignInput,
      product_id: assignProductData?.product.id,
      product_name: assignProductData?.product.name,
      employee_id: assignProductData?.employee.id,
    };

    fetch(`/api/employee_inventories/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })
      .then((res) => {
        if (res.ok) {
          toast.success(
            "Sent a prompt for the employee to be accepted or rejected."
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
            toast.error("Failed to Transfer the inventory");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occured.");
      });
  };

  const acceptSubmit = (data) => {
    const productData = {
      id: data?.id,
      employee_id: data?.employee.id,
      product_name: data?.product?.name,
      product_id: data?.product.id,
      accept: false,
    };
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to accept this inventory`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventory_prompts/${data?.id}/accept`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(productData),
            })
              .then((res) => {
                if (res.ok) {
                  toast.success(
                    "You have accepted this inventory successfully."
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
                    toast.error("Failed to accept this inventory.");
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

  const denySubmit = (data) => {
    const productData = {
      id: data?.id,
      employee_id: data?.employee.id,
      product_name: data?.product?.name,
      product_id: data?.product.id,
      accept: true,
    };
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to deny this inventory`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/inventory_prompts/${data?.id}/reject`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(productData),
            })
              .then((res) => {
                if (res.ok) {
                  toast.success("You have reject this inventory.");
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } else if (res.status == 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to deny this inventory.");
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
            //console.log("Click No");
          },
        },
      ],
    });
  };

  const requestInvetorySubmit = (e) => {
    e.preventDefault();

    fetch(`/api/inventory_requests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...requestInvetroryInput,
        employee_id: userProfile.id,
        employee_name: userProfile.name,
      }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success("You have requested inventory successfully");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (res.status === 404) {
          res.json().then((json) => {
            toast.error("Please provide a client.");
          });
        } else {
          res.json().then((json) => {
            toast.error("Failed to request this inventory.");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occured.");
      });
  };

  if (loading) return <Header></Header>;
  if (errors) return <h1>{errors}</h1>;

  return (
    <div>
      <Header userProfile={userProfile} />
      {/* showing the Assign Product modal once */}
      <AssignModal
        showAssignMadal={showAssignMadal}
        setShowAssignMadal={setShowAssignMadal}
        assignSubmit={assignSubmit}
        assignProductData={assignProductData}
        setAssignProductData={setAssignProductData}
        employeeList={otherEmployeesList}
        setAssignInput={setAssignInput}
        assignInput={assignInput}
        employee={employee}
      />
      <Modal
        show={showRequestInvetory}
        onHide={() => setshowRequestInvetory(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Request Inventory
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="flex justify-between flex-col items-center gap-2">
          <div className="w-full">
            <Form
              className="flex flex-col gap-4"
              onSubmit={requestInvetorySubmit}
            >
              <Form.Select
                aria-label="Default select example"
                onChange={(e) =>
                  setRequestInvetroryInput({
                    ...requestInvetroryInput,
                    product_name: e.target.value,
                  })
                }
                required
              >
                <option value="">Select The Product</option>
                {productList?.map((product) => {
                  return (
                    <option key={product?.id} value={product?.name}>
                      {product?.name}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control
                type="number"
                placeholder={`Type Quantity`}
                onChange={(e) =>
                  setRequestInvetroryInput({
                    ...requestInvetroryInput,
                    quantity: e.target.value,
                  })
                }
                max={requestInvetroryInput?.quantity}
                min={1}
                required
              />

              <Form.Control
                type="date"
                // placeholder={`Type Quantity`}
                onChange={(e) =>
                  setRequestInvetroryInput({
                    ...requestInvetroryInput,
                    date_of_use: e.target.value,
                  })
                }
                required
              />

              <Button type="submit">Submit</Button>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowAssignMadal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      {/* showing the modal once */}
      {modalShow && (
        <CustomModal
          show={modalShow}
          onHide={handleClick}
          invoiceData={invoiceData}
          // show={true}
        />
      )}
      <br />
      <div className="flex justify-center">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          {employee?.name}
        </h1>
      </div>
      <div className="flex  justify-end mr-8">
        <Button
          onClick={() => setshowRequestInvetory(true)}
          className="text-4xl font-bold text-center text-blue-600"
        >
          Request Inventory
        </Button>
      </div>
      {userProfile?.inventory_prompts?.filter(
        (prompt) => !prompt.is_accepted === true
      )?.length > 0 && (
        <>
          <h2 className="text-4xl font-bold text-center text-blue-400">
            Inventory Assigned
          </h2>
          <Table bordered hover responsive className="w-full mt-4 text-center">
            <thead>
              <tr>
                <th>Product </th>
                <th>Product Type </th>
                <th>Quantity</th>
                <th>Assigned By</th>
                <th className="w-[12rem]"></th>
              </tr>
            </thead>
            <tbody>
              {userProfile?.inventory_prompts?.map((data) => {
                return (
                  <>
                    {!data?.is_accepted && (
                      <tr key={data?.id}>
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
                            <span>{data?.quantity} </span>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div className="flex flex-col  gap-2">
                            <span>{data?.assigned_by} </span>
                          </div>
                        </td>

                        <td className="align-middle">
                          <div className=" flex justify-around gap-3">
                            <Button
                              onClick={async () => {
                                acceptSubmit({ ...data, isDelete: false });
                              }}
                              variant="info"
                            >
                              Accept
                            </Button>
                            <Button
                              onClick={async () => {
                                denySubmit({ ...data, isDelete: true });
                              }}
                              variant="danger"
                            >
                              Deny
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </Table>
        </>
      )}
      <div className=" container mx-auto my-3">
        <h2 className="text-4xl font-bold text-center text-blue-400">
          Products
        </h2>
        <Table bordered hover responsive className="w-full mt-4 text-center">
          <thead>
            <tr>
              <th>Product </th>
              <th>Product Type</th>
              <th>Quantity</th>
              <th>Assign</th>
            </tr>
          </thead>
          <tbody>
            {employee?.employees_inventories?.map((data) => {
              // console.log(data);
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
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <br />
      <h2 className="text-4xl font-bold text-center text-blue-400">
        My invoices
      </h2>
      <br />
      <ul className=" mx-1 mb-3 justify-center flex flex-wrap gap-3 ">
        {employee?.invoices.map((invoice) => {
          // //console.log({ invoice });
          return (
            <li key={invoice.id}>
              <Card
                className="text-center"
                border="info"
                style={{ width: "18rem" }}
              >
                <Card.Header as="h5">Invoice ID {invoice.id}</Card.Header>
                <Card.Body className="">
                  <Button
                    onClick={async () => {
                      await setinvoiceData(invoice);
                      handleClick();
                    }}
                    variant="info"
                  >
                    See More Details
                  </Button>
                </Card.Body>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UserPage;
