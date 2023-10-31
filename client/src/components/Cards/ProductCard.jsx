import React, { memo } from "react";
import { OverlayTrigger } from "react-bootstrap";

const ProductCard = ({
  product,
  isAdmin,
  handleDelete,
  updatePopover,
  setupdateProductInput,
}) => {
  return (
    <div className="w-[20rem] bg-blue-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-blue-800 text-xl font-bold mb-2">{product.name}</h2>
      <p className="text-blue-700">Product Type: {product.product_type}</p>
      <p className="text-blue-700">Retail Price: ${product.retail_price}</p>
      {isAdmin && (
    <p className="text-blue-700">Cost Price: ${product.cost_price}</p>
  )}
      {isAdmin && isAdmin ? (
        <div className="flex  justify-center items-center gap-3 flex-wrap flex-row md:flex-nowrap">
          <button
            onClick={() => handleDelete(product)}
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
            <button
              onClick={() => setupdateProductInput(product)}
              className="bg-blue-500 hover:bg-red-400 text-white  py-2 px-4 rounded mt-2"
            >
              Update Product
            </button>
          </OverlayTrigger>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default memo(ProductCard);
