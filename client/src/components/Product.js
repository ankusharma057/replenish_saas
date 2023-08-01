import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

export default function Product({ product, onDeleteProduct, onSave, isAdmin }) {
  const { id } = product;
  const [name, setName] = useState(product.name);
  const [productType, setProductType] = useState(product.product_type);
  const [costPrice, setCostPrice] = useState(product.cost_price);
  const [retailPrice, setRetailPrice] = useState(product.retail_price);

  const [userProfile, setUserProfile] = useState(null);

  const handleSave = async () => {
    const updatedProduct = {
      ...product,
      name,
      product_type: productType,
      cost_price: costPrice,
      retail_price: retailPrice,
    };

    const response = await fetch("/api/products/" + product.id + "", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProduct),
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const errorMessage = "Failed to update product";
      console.error(errorMessage);
      return;
    }

    onSave(updatedProduct);
  };

  const updatePopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Edit Product</Popover.Header>
      <Popover.Body>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Label>Product Type</Form.Label>
          <Form.Control
            type="text"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
          />
          <Form.Label>Cost Price</Form.Label>
          <Form.Control
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(parseFloat(e.target.value))}
          />
          <Form.Label>Retail Price</Form.Label>
          <Form.Control
            type="number"
            value={retailPrice}
            onChange={(e) => setRetailPrice(parseFloat(e.target.value))}
          />
          <br></br>
          <Button onClick={handleSave}>Save your changes</Button>
        </Form.Group>
      </Popover.Body>
    </Popover>
  );

  const handleDelete = () => {
    console.log("deleted");

    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this product",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch("/api/products/" + product.id + "", { method: "DELETE" }).then(
              () => window.location.reload()
            );
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  // debugger;
  const tailwindProductCard = (
    <div className="w-[20rem] bg-blue-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-blue-800 text-xl font-bold mb-2">{product.name}</h2>
      <p className="text-blue-700">Product Type: {product.product_type}</p>
      <p className="text-blue-700">Cost Price: ${product.cost_price}</p>
      <p className="text-blue-700">Retail Price: ${product.retail_price}</p>
      {isAdmin && isAdmin ? (
        <div className="flex  justify-center items-center gap-3 flex-wrap flex-row md:flex-nowrap">
          <button
            onClick={handleDelete}
            className="bg-blue-500 hover:bg-red-400 text-white  py-2 px-4 rounded mt-2"
          >
            Remove Product
          </button>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={updatePopover}
          >
            <button className="bg-blue-500 hover:bg-red-400 text-white  py-2 px-4 rounded mt-2">
              Update Product
            </button>
          </OverlayTrigger>
        </div>
      ) : (
        <></>
      )}
    </div>
  );

  return <div>{tailwindProductCard}</div>;
}
