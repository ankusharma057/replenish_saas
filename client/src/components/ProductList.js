import { useState } from "react";
import Header from "./Header";
import { Button, Card, Modal, Table, Form, InputGroup } from "react-bootstrap";
import Product from "./Product";

export default function ProductList({
  productList,
  onDeleteProduct,
  onSave,
  userProfile,
}) {
  const [searchInput, setSearchInput] = useState("");

  const [filteredProductList, setFilteredProductList] = useState(productList);

  const filteredInventoryList = productList
    // userProfile.has_access_only_to === "all"
    //   ? productList
    //   : productList?.filter(
    //       (product) => product?.product_type === userProfile.has_access_only_to
    //     );

  return (
    <div>
      <Header userProfile={userProfile} />
      <br />

      <div className="flex mt-2 gap-2 justify-center">
        <div className="w-[52.5rem]">
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
          {userProfile?.is_admin && (
            <a href="/addproduct" type="button" className="btn btn-primary">
              Add product
            </a>
          )}
        </div>
      </div>
      <br></br>
      <div className="justify-center flex flex-wrap gap-3">
        {filteredInventoryList
          ?.filter((product) => {
            return product.name
              ?.toLowerCase()
              .includes(searchInput?.toLocaleLowerCase());
          })
          ?.map((product) => (
            <Product
              key={product.id}
              isAdmin={userProfile?.is_admin}
              product={product}
              onSave={onSave}
              onDeleteProduct={onDeleteProduct}
            />
          ))}
      </div>
    </div>
  );
}
