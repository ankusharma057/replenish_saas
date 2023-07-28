import React from "react";

const InvoicePdf = ({
  userProfile,
  currentClient,
  matchingClients,
  formData,
  getTotalPaidByClient,
  getTotal,
  currentProduct,
  matchingProducts,
  currentRetailProduct,
  product,
  matchingRetailProducts,
  getTotalProductPriceSum,
  selectedProduct,
  ref,
}) => {
  const OverheadFeeType = {
    percentage: "Percentage",
    fixed: "Fixed Amount",
  };
  return (
    <div ref={ref} className="max-w-4xl mx-auto bg-white p-4 rounded-md">
      <div className="border rounded-sm p-2 mb-4 flex justify-content-around">
        <div>
          <h4 className="text-2xl">Provider:</h4>
          <div>{userProfile?.name}</div>
        </div>
        <div className="mb-3 block">
          Client Name:
          <p
            type="text"
            //   onChange={handleClientNameChange}
            className="w-full mt-1 p-1 min-h-[2rem] border-gray-300 border rounded-md"
            required
          >
            {currentClient?.name}
          </p>
        </div>
        <div className="mb-2 block">
          Date of Service:
          <p className="w-full mt-1 p-1 min-h-[2rem] border-gray-300 border rounded-md">
            {formData?.dateOfService}
          </p>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
        }}
      >
        <div>
          <div className="border rounded-sm p-2 mb-4 w-100">
            <div className="mb-2 block">
              Concierge Fee Paid:{" "}
              <span>{formData?.conciergeFeePaid ? "☑️" : "☐"}</span>
            </div>

            <div className="mb-2 block">
              Paid by Client Cash:
              <p className="w-full mt-1 p-1 min-h-[2rem] border-gray-300 border rounded-md">
                {formData?.paidByClientCash}
              </p>
            </div>
            <div className="mb-2 block">
              Paid by Client Credit:
              <p className="w-full mt-1 p-1 min-h-[2rem] border-gray-300 border rounded-md">
                {formData?.paidByClientCredit}{" "}
              </p>
            </div>
            <div className="block">
              Total paid by client: {getTotalPaidByClient}
            </div>
          </div>
          <div className="border rounded-sm p-2 mb-4 w-100">
            <div className="mb-2 block">
              Personal Discount:
              <p className="w-full mt-1 p-1 min-h-[2rem] border-gray-300 border rounded-md">
                {formData?.personalDiscount}
              </p>
            </div>
            <div className="mb-2 block">
              Tip:
              <p className="w-full mt-1 p-1 min-h-[2rem] border-gray-300 border rounded-md">
                {formData?.tip}
              </p>
            </div>
          </div>
          <div className="border rounded-sm p-2 mb-4">
            <div className="mb-2 block  max-w-4xl">
              Comments:
              <p className="w-full mt-1 p-1  min-h-[2rem]  border-gray-300 border rounded-md">
                {formData?.comments}
              </p>
            </div>
          </div>
          <div className="border rounded-sm p-2 mb-4 w-100">
            <div className="block">Total: {getTotal}</div>
          </div>
        </div>
        <div>
          <div className="border rounded-sm p-2 mb-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Products Used</th>
                  <th>Product Quantity</th>
                  <th>Price</th>
                  <th>Total Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr key={1}>
                  {/* <td>
                      <p className="w-full p-1  min-h-[2rem] border-gray-500 border rounded-md">
                        {currentProduct?.name}
                      </p>
                    </td>
                    <td>
                      <p className="w-full p-1  min-h-[2rem] border-gray-500 border rounded-md">
                        {currentProduct?.quantity}
                      </p>
                    </td>
                    <td>
                      <p className="w-full p-1  min-h-[2rem] border-gray-500 border rounded-md">
                        {currentProduct?.price}
                      </p>
                    </td>
                    <td>{currentProduct?.quantity * currentProduct?.price}</td> */}
                </tr>
                {formData?.products.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                        {product?.name}
                      </p>
                    </td>
                    <td>
                      <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                        {product?.quantity}
                      </p>
                    </td>
                    <td>
                      <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                        {product?.cost_price}
                      </p>
                    </td>
                    <td>{product?.quantity * product?.cost_price}</td>
                    {/* <td>
                        <button
                          type="button"
                          //   onClick={() => removeProduct(index)}
                          className="text-red-500   border-2 border-red-500 px-2"
                        >
                          &#10005;
                        </button>
                      </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border rounded-sm p-2 mb-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Retail Products</th>
                  <th>Product Quantity</th>
                  <th>Price</th>
                  <th>Total Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* <tr key={1}>
                    <td>
                      <input
                        type="text"
                        name="productName"
                        value={currentRetailProduct?.name}
                        // onChange={handleRetailProductNameChange}
                        className="w-full p-1 border-gray-500 border rounded-md"
                        // required
                      />
                      {matchingRetailProducts?.length > 0 && (
                        <div className="absolute bg-white w-sm max-h-40 overflow-y-auto rounded-md mt-1 shadow-md">
                          {matchingRetailProducts.map((product) => (
                            <p
                              key={product?.id}
                              className="p-2 cursor-pointer hover:bg-gray-100"
                              //   onClick={() =>
                              //     handleRetailProductSelection(product?.name)
                              //   }
                            >
                              {product?.name}
                            </p>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        name="productQuantity"
                        value={currentRetailProduct?.quantity}
                        // onChange={handleRetailQuantityChange}
                        min="1"
                        className="w-full p-1 border-gray-300 border rounded-md"
                      />
                    </td>
                    <td>
                      <input
                        type="string"
                        name="productPrice"
                        value={currentRetailProduct?.price}
                        className="w-full p-1 border-gray-300 border rounded-md"
                      />
                    </td>
                    <td>
                      {currentRetailProduct?.quantity *
                        currentRetailProduct?.price}
                    </td>
                    <td>
                      <button
                        type="button"
                        // onClick={handleAddRetailProduct}
                        // className={`${
                        //   selectedRetailProduct
                        //     ? "text-green-500 border-green-500"
                        //     : "text-gray-500 border-gray-500"
                        // } border-2 px-2`}
                        // disabled={!selectedRetailProduct}
                      >
                        &#x2713;
                      </button>
                    </td>
                  </tr> */}
                {formData?.retailProducts.map((product, index) => (
                  <tr key={index}>
                    <td>
                      <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                        {product?.name}
                      </p>
                    </td>
                    <td>
                      <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                        {product?.quantity}
                      </p>
                    </td>
                    <td>
                      <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                        {product?.cost_price}
                      </p>
                    </td>
                    <td>{product?.quantity * product?.cost_price}</td>
                    {/* <td>
                        <button
                          type="button"
                          //   onClick={() => removeRetailProduct(index)}
                          className="text-red-500   border-2 border-red-500 px-2"
                        >
                          &#10005;
                        </button>
                      </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border rounded-sm p-2 mb-4">
            <div className="block">
              GFE:
              {/* <input
                  type="checkbox"
                  name="gfe"
                  checked={formData?.gfe}
                  //   onChange={(event) => handleInputChange(event)}
                  className="ml-2"
                /> */}
              <span>{formData?.gfe ? " ☑️" : " ☐"}</span>
            </div>
            <div className="block">
              Overhead Fee Type:
              <p className="w-full mt-1 p-1 border-gray-300 border rounded-md">
                {OverheadFeeType[formData?.overheadFeeType] || ""}
              </p>
            </div>
            <label className="block">
              Overhead Fee Value:
              {/* <input
                  type="number"
                  name="overheadFeeValue"
                  value={formData?.overheadFeeValue}
                  min="0"
                  //   onChange={(event) => handleInputChange(event)}
                  className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                /> */}
              <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                {formData?.overheadFeeValue}
              </p>
            </label>
            <label className="block">
              Total Product Price Sum: {getTotalProductPriceSum}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePdf;
