import React, { useEffect, useState } from "react";
import ProductTable from "../Tables/ProductTable";
import { useAuthContext } from "../../context/AuthUserContext";
import { deleteProduct, getProductsList, updateProduct } from "../../Server";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import ModalWraper from "../Modals/ModalWraper";
import LabelInput from "../Input/LabelInput";
import Loadingbutton from "../Buttons/Loadingbutton";
import { Form } from "react-bootstrap";
import CreateProductModal from "../Modals/CreateProductModal";

const ProductsTab = ({
  productSearchInput,
  setProductSearchInput,
  show,
  onHide,
  filteredInventory,
}) => {
  const { authUserState } = useAuthContext();
  const [productList, setProductList] = useState([]);
  const [updateProductInput, setUpdateProductInput] = useState({
    name: "",
    product_type: "",
    cost_price: "",
    provider_purchased:"",
    retail_price: "",
  });
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
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
    setProductList(filteredInventory);
    return () => {};
  }, [filteredInventory]);

  const handleProductChange = (e) => {
    const {name, value, type, checked} = e.target
    setUpdateProductInput((pre) => ({
      ...pre,
      [name]:(type === "checkbox") ? checked :  value,
    }));
    if(name === "name" && value.length === 0){
      setUpdateProductInput((prev)=>({...prev,["provider_purchased"]:false}))
    }
    if(type === "checkbox"){
      if(!(/^pp\s/i).test(updateProductInput.name) && checked && updateProductInput.name !== ""){
        setUpdateProductInput((prev)=>({...prev,["name"]:`PP ${updateProductInput.name}`}))
      }
      else{
        setUpdateProductInput((prev)=>({...prev,["name"]:updateProductInput.name.replace(/^pp\s/i,"")}))
      }
    }
  };

  console.log("ssss",updateProductInput);

  const handleDelete = (product) => {
    // console.log(product);
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
      provider_purchased:updateProductInput.provider_purchased,
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

  return (
    <div className="h-full w-full">
      {(productList || []).length > 0 && (
        <ProductTable
          productSearchInput={productSearchInput}
          setProductSearchInput={setProductSearchInput}
          userProfile={authUserState}
          handleDelete={handleDelete}
          productList={productList}
          setUpdateProductInput={setUpdateProductInput}
          setShowUpdateProductModal={setShowUpdateProductModal}
        />
      )}

      {/*Update Modal */}
      <ModalWraper
        show={showUpdateProductModal}
        onHide={() => setShowUpdateProductModal(false)}
        title="Update Product"
      >
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
          <label className="flex justify-between font-  py-2 rounded-md transition duration-500">
            Provider Purchased
            <input
              type="checkbox"
              name="provider_purchased"
              checked={updateProductInput?.provider_purchased}
              // checked={true}
              disabled={((updateProductInput.name).length <= 0)? true : false}
              onChange={handleProductChange}
              className="mr-5"
            />
          </label>
          <br></br>
          <Loadingbutton
            isLoading={loading}
            title="Save your changes"
            loadingText={"Saving your changes..."}
            type="submit"
          />
        </Form>
      </ModalWraper>

      <CreateProductModal
        show={show}
        onHide={() => onHide(false)}
        getProducts={getProducts}
        productList={productList}
      />
    </div>
  );
};

export default ProductsTab;
