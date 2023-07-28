import React from "react";

const AddInvoiceTemplate = ({
  id,
  userName,
  clientname,
  dateOfService,
  conciergeFeePaid,
  gfe,
  semaglitudeConsultation,
  paidByClientCash,
  paidByClientCredit,
  personalDiscount,
  tip,
  comments,
  products,
  retailProducts,
  charge,
  getTotalPriceByClient,
  totalConsumableCost,
  handleDeleteInvoice,
  handleEditInvoice,
}) => {
  const invoiceData = {
    id,
    userName,
    clientname,
    dateOfService,
    conciergeFeePaid,
    gfe,
    semaglitudeConsultation,
    paidByClientCash,
    paidByClientCredit,
    personalDiscount,
    tip,
    comments,
    products,
    retailProducts,
    charge,
    getTotalPriceByClient,
    totalConsumableCost,
    handleDeleteInvoice,
    handleEditInvoice,
  };

  return (
    <div>
      <div className="bg-blue-200">
        <div className="max-w-full md:max-w-4xl mx-auto bg-white md:p-4 rounded-md">
          <div className="border rounded-sm p-2 mb-4 flex flex-wrap justify-start flex-col md:flex-row md:justify-around">
            <div className="text-center">
              <h4>Provider:</h4>
              <div>{userName}</div>
            </div>
            <div className="flex gap-4 mt-2 md:mt-0">
              <div className=" mb-3 block">
                <span className="text-gray-700 mr-2"> Client Name:</span>
                {clientname}
              </div>
              <div className="mb-2 block">
                <span className="text-gray-700 mr-2"> Date of Service:</span>
                {dateOfService}
              </div>
            </div>
          </div>
          <div
            style={{
              gridTemplateColumns: "1fr 2fr",
              gap: "20px",
            }}
            className="flex flex-col-reverse md:grid"
          >
            <div className="px-2">
              <div className="border rounded-sm p-2 mb-4 w-100">
                <div className="mb-2 block">
                  Concierge Fee Paid:
                  {conciergeFeePaid ? "☑" : "▢"}
                </div>
                <div className="block">GFE: {gfe ? "☑" : "▢"}</div>
                <div className="block">Semag Consult Fee: {semaglitudeConsultation ? "☑" : "▢"}</div>
                <div className="mb-2 block">
                  Paid by Client Cash:
                  {Number(paidByClientCash).toString()}
                </div>

                <div className="mb-2 block">
                  Paid by Client Credit: {Number(paidByClientCredit).toString()}
                </div>

                <div className="block">
                  Total paid by client: {getTotalPriceByClient}
                </div>
              </div>
              <div className="border rounded-sm p-2 mb-4 w-100">
                <div className="mb-2 block">
                  Personal Discount: {personalDiscount}
                </div>
                <div className="mb-2 block">Tip: {tip}</div>
              </div>
              <div className="border rounded-sm p-2 mb-4">
                <div className="mb-2 block ">Comments: {comments}</div>
              </div>
              <div className="border rounded-sm p-2 mb-4 w-100">
                <div className="block">Total: {charge}</div>
              </div>
              <button
                onClick={() => handleDeleteInvoice(id)}
                className="w-full md:hidden bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
            <div className="px-2">
              <div className="border overflow-x-auto rounded-sm p-2 mb-4 products-used">
                <table className="w-full table-auto ">
                  <thead className="whitespace-normal">
                    <tr>
                      <th className="min-w-[10rem]">Products/Services</th>
                      <th className="min-w-[10rem]">Product Quantity</th>
                      <th className="min-w-[5rem]">Price</th>
                      <th className="min-w-[5rem] md:text-left text-center">
                        Total Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-normal">
                    {products?.map((product, index) => (
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
                          <p className="w-full p-1 text-center border-gray-500 border rounded-md my-1">
                            {product?.cost_price}
                          </p>
                        </td>
                        <td className=" text-center">
                          {product?.quantity * product?.cost_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border rounded-sm p-2 overflow-x-auto mb-4 retail-products">
                <table className="w-full table-autol">
                  <thead>
                    <tr>
                      <th className="min-w-[10rem]">Retail Products</th>
                      <th className="min-w-[10rem]">Product Quantity</th>
                      <th className="min-w-[5rem]">Price </th>
                      <th className="min-w-[5rem] md:text-left text-center">
                        Total Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {retailProducts?.map((product, index) => (
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
                          <p className="w-full p-1 text-center border-gray-500 border rounded-md my-1">
                            {product?.cost_price}
                          </p>
                        </td>
                        <td className="text-center">
                          {product?.quantity * product?.cost_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border rounded-sm p-2 mb-4">
                <div className="block">
                  Total Product Price Sum: {totalConsumableCost}
                </div>
              </div>
              <div className="flex gap-4 ">
                <button
                  onClick={() => handleDeleteInvoice(id)}
                  className="w-full hidden md:block bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInvoiceTemplate;
