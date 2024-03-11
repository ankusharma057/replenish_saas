import React, { useEffect, useState } from "react";
import { Form, InputGroup, Popover } from "react-bootstrap";
import { useAuthContext } from "../context/AuthUserContext";
import ProductCard from "../components/Cards/ProductCard";
import { deleteProduct, getProductsList, updateProduct } from "../Server";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { Link } from "react-router-dom";

const Products = () => {
  const { authUserState } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [updateProductInput, setupdateProductInput] = useState({
    name: "",
    product_type: "",
    cost_price: "",
    retail_price: "",
  });
  const [loading, setLoading] = useState(false);

  // added
  const getProducts = async (refetch = false) => {
    try {
      const { data } = await getProductsList(refetch);
      setProductList(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getProducts();
    return () => {};
  }, []);

  const handleProductChange = (e) => {
    setupdateProductInput((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDelete = (product) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this product",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await deleteProduct(product.id);
              toast.success(`${product?.name} Deleted Successfully.`);
              await getProducts(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to Delete the Product."
              );
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const updatedProduct = {
      name: updateProductInput.name,
      product_type: updateProductInput.product_type,
      cost_price: updateProductInput.cost_price,
      retail_price: updateProductInput.retail_price,
    };
    try {
      setLoading(true);
      await updateProduct(updateProductInput.id, updatedProduct);
      toast.success(`${updateProductInput?.name} Updated Successfully.`);
      await getProducts(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message ||
          "Failed to Delete the Product."
      ); // handle error
    } finally {
      setLoading(false);
    }
  };


  const updatePopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Edit Product</Popover.Header>
      <Popover.Body>
        <Form onSubmit={handleSave} className="mb-3">
          <LabelInput
            label="Name"
            type="text"
            value={updateProductInput.name}
            controlId="name"
            name="name"
            placeholder={` Type name `}
            onChange={handleProductChange}
            required={true}
          />

          <LabelInput
            label="Product Type"
            type="text"
            value={updateProductInput.product_type}
            controlId="product_type"
            name="product_type"
            placeholder={`Enter Product Type`}
            onChange={handleProductChange}
            required={true}
          />

          <LabelInput
            label="Cost Price"
            value={updateProductInput.cost_price}
            controlId="cost_price"
            name="cost_price"
            placeholder={`Enter Cost Price`}
            onChange={handleProductChange}
            required={true}
            type="number"
          />

          <LabelInput
            label="Retail Price"
            value={updateProductInput.retail_price}
            controlId="retail_price"
            name="retail_price"
            placeholder={`Enter Retail Price`}
            onChange={handleProductChange}
            required={true}
            type="number"
          />
          <br></br>
          <Loadingbutton
            isLoading={loading}
            title="Save your changes"
            loadingText={"Saving your changes..."}
            type="submit"
          />
        </Form>
      </Popover.Body>
    </Popover>
  );

  return (
    <>
      {/* <Header /> */}
      <br />
      <div className="flex mt-2 gap-2 justify-center">
        <div className="w-[52.5rem] max-w-[80%]">
          <InputGroup className="mb-3 ">
            <Form.Control
              placeholder="Search Product Name here"
              aria-label="Search Product Name here"
              aria-describedby="basic-addon2"
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <InputGroup.Text id="basic-addon2">&#x1F50D;</InputGroup.Text>
          </InputGroup>
        </div>
        <div>
          {authUserState.user?.is_admin && (
            <Link to="/addproduct" type="button" className="btn btn-primary">
              Add product
            </Link>
          )}
        </div>
      </div>
      <div className="justify-center flex flex-wrap gap-3">
        {productList
          ?.filter((product) => {
            return product.name
              ?.toLowerCase()
              .includes(searchInput?.toLocaleLowerCase());
          })
          .map((product) => (
            <ProductCard
              product={product}
              key={product.id}
              isAdmin={authUserState.user.is_admin}
              handleDelete={handleDelete}
              updatePopover={updatePopover}
              setupdateProductInput={setupdateProductInput}
            />
          ))}
      </div>
    </>
  );
};

export default Products;
