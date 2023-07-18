import { Button, Form, Modal, Table } from "react-bootstrap";
const InventoryModal = ({
  showModal,
  setshowModal,
  inventoryList,
  updateQtySubmit,
  updateQtyInput,
  isQtyUpdate,
  setUpdateQtyInput,
  invList,
}) => {
  const dataList = inventoryList?.employees_inventories || invList;
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
                  <tr key={data?.product.id}>
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
        <Button onClick={() => setshowModal(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InventoryModal;
