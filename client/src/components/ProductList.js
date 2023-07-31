import { useState } from "react";
import Header from "./Header";
import Product from "./Product";

export default function ProductList({
  productList,
  onDeleteProduct,
  onSave,
  userProfile,
}) {
  const [searchInput, setSearchInput] = useState("");

  const [filteredProductList, setFilteredProductList] = useState(productList);

  const filteredInventoryList =
    userProfile.has_access_only_to === "all"
      ? productList
      : productList?.filter(
          (product) => product?.product_type === userProfile.has_access_only_to
        );

  return (
    <div>
      <Header userProfile={userProfile} />
      <br />
      <div className="col-md-12 text-center">
        <div className="col-md-12 text-center">
          <input
            type="text"
            className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search Product Name here"
            onChange={(event) => setSearchInput(event.target.value)}
          />
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
