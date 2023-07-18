import { useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import AssignModal from "./AssignModal";

const UpdateModal = ({
  updateModalShow,
  setUpdateModalShow,
  employeeList,
  userProfile,
}) => {
  const [entireInventory, setEntireInventory] = useState([]);
  const [assignProductData, setAssignProductData] = useState({});
  const [showAssignMadal, setShowAssignMadal] = useState(false);

  const [assignInput, setAssignInput] = useState({
    quantity: 0,
  });
  useEffect(() => {
    fetch("/api/inventories")
      .then((r) => r.json())
      .then((data) => {
        // console.log({data});
        setEntireInventory(data);
      });
  }, []);

  const assignSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...assignInput,
      product_name: assignProductData?.product?.name,
      is_admin: true,
      userProfile_id: userProfile?.id,
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
          toast.success("Prompted Employee for the inventory.");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (res.status === 404) {
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

  return (
    <>
      <AssignModal
        showAssignMadal={showAssignMadal}
        setShowAssignMadal={setShowAssignMadal}
        assignSubmit={assignSubmit}
        assignProductData={assignProductData}
        setAssignProductData={setAssignProductData}
        setAssignInput={setAssignInput}
        assignInput={assignInput}
        employeeList={employeeList}
        employee={userProfile}
      />
      <Modal
        show={updateModalShow}
        onHide={() => setUpdateModalShow(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Inventories
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center flex  flex-col gap-4">
          <div className="max-h-96 overflow-auto">
            <Table bordered hover responsive className="w-full text-center ">
              <thead>
                <tr>
                  <th className="w-1/2">Product </th>
                  <th>Quantity</th>
                  <th>Assign</th>
                </tr>
              </thead>

              <tbody>
                {entireInventory?.map((data) => {
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
                          <span>{data?.quantity} </span>
                        </div>
                      </td>

                      <td className="align-middle">
                        <Button
                          variant="info"
                          onClick={() => {
                            setAssignProductData(data);
                            setShowAssignMadal(true);
                            setUpdateModalShow(false);
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
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setUpdateModalShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
const InventoryModal = ({
  showModal,
  setshowModal,
  inventoryList,
  updateQtySubmit,
  updateQtyInput,
  isQtyUpdate,
  setUpdateQtyInput,
  invList,
  userProfile,
  employeeList,
}) => {
  const dataList = inventoryList?.employees_inventories || invList;

  const [updateModalShow, setUpdateModalShow] = useState(false);

  return (
    <Modal
      show={showModal}
      onHide={() => setshowModal(false)}
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
                {/* <th>Assign</th> */}
              </tr>
            </thead>

            <tbody>
              {dataList?.map((data) => {
                return (
                  <tr key={data?.product?.id}>
                    <td className="align-middle">
                      <div className="flex flex-col  gap-2">
                        <span>{data?.product?.name} </span>
                        {/* <span>Product Name: Product </span> */}
                      </div>
                    </td>
                    <td className="align-middle">
                      {isQtyUpdate ? (
                        <Form className="flex flex-col gap-4">
                          <Form.Control
                            type="number"
                            defaultValue={data?.quantity}
                            onChange={(e) => {
                              setUpdateQtyInput({
                                ...updateQtyInput,
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
                        <div className="flex flex-col  gap-2">
                          <span>{data?.quantity} </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {isQtyUpdate && <Button onClick={updateQtySubmit}>Update</Button>}
        <Button
          onClick={() => {
            return setUpdateModalShow(true);
          }}
        >
          Update
        </Button>
        <Button onClick={() => setshowModal(false)}>Close</Button>
      </Modal.Footer>

      <UpdateModal
        setUpdateModalShow={setUpdateModalShow}
        updateModalShow={updateModalShow}
        employeeList={employeeList}
        userProfile={userProfile}
      />
    </Modal>
  );
};

export default InventoryModal;
