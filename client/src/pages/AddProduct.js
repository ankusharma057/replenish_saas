import React, { useState } from "react";
import { Form } from "react-bootstrap";
import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { createProduct } from "../Server";
import { toast } from "react-toastify";

const AddProduct = () => {
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
      //   await getProducts(true);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(
        error.response?.data?.exception ||
          error.response.statusText ||
          error.message ||
          "Failed to Create Product."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* <Header /> */}
      <Form
        className="max-w-md mx-auto mt-4 p-4 bg-blue-200 shadow-lg flex flex-col gap-2 rounded-lg"
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

        <div className="flex justify-center">
          <Loadingbutton
            isLoading={loading}
            title="Add product"
            loadingText={"Adding product..."}
            type="submit"
            className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </div>
      </Form>
    </div>
  );
};

export default AddProduct;
