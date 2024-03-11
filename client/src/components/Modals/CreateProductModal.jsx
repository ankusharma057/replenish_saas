import React, { useState } from "react";
import { Form } from "react-bootstrap";
import LabelInput from "../Input/LabelInput";
import Loadingbutton from "../Buttons/Loadingbutton";
import { toast } from "react-toastify";
import ModalWraper from "./ModalWraper";
import { createProduct } from "../../Server";

const CreateProductModal = ({ show, onHide, getProducts }) => {
  const initialFormData = {
    name: "",
    product_type: "",
    cost_price: "",
    retail_price: "",
  };

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    setFormData((pre) => ({ ...pre, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await createProduct(formData);
      toast.success(`Product Created Successfully.`);
      await getProducts(true);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(
        error.response?.data?.exception ||
          error?.response?.statusText ||
          error.message ||
          "Failed to Create Product."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWraper
      footer={
        <>
          <div className="flex justify-center">
            <Loadingbutton
              form="addNewProduct"
              isLoading={loading}
              title="Add product"
              loadingText={"Adding product..."}
              type="submit"
            />
          </div>
        </>
      }
      title={"Create new product"}
      show={show}
      onHide={onHide}
    >
      <Form
        id="addNewProduct"
        className="max-w-md mx-auto mt-4 p-4 flex flex-col gap-2 rounded-lg"
        onSubmit={handleSubmit}
      >
        <LabelInput
          label="Product Name"
          type="text"
          controlId="name"
          name="name"
          placeholder={`Enter Product Name`}
          required={true}
          labelClassName="font-bold text-gray-700"
          value={formData.name}
          onChange={handleChange}
        />

        <LabelInput
          label="Product Type"
          controlId="product_type"
          placeholder={`Enter Product Type`}
          required={true}
          labelClassName="font-bold text-gray-700"
          type="text"
          name="product_type"
          value={formData.product_type}
          onChange={handleChange}
        />

        <LabelInput
          label="Cost Price"
          controlId="cost_price"
          placeholder={`Enter Cost Price`}
          required={true}
          labelClassName="font-bold text-gray-700"
          type="number"
          name="cost_price"
          value={formData.cost_price}
          onChange={handleChange}
          min="0"
        />

        <LabelInput
          label="Retail Price"
          controlId="retail_price"
          placeholder={`Enter Retail Price`}
          required={true}
          labelClassName="font-bold text-gray-700"
          type="number"
          name="retail_price"
          value={formData.retail_price}
          onChange={handleChange}
          min="0"
        />
      </Form>
    </ModalWraper>
  );
};

export default CreateProductModal;
