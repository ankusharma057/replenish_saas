import React, { useRef, useState } from "react";
import Header from "./Header";
import { toast } from "react-toastify";
import { Alert, Button } from "react-bootstrap";
import AddInvoiceTemplate from "./AddInvoiceTemplate";
import { confirmAlert } from "react-confirm-alert"; // Import

const initialFormState = {
  clientName: "",
  dateOfService: "",
  conciergeFeePaid: false,
  gfe: false,
  semaglitudeConsultation: false,
  paidByClientCash: 0,
  paidByClientCredit: 0,
  personalDiscount: 0,
  tip: 0,
  comments: "",
  products: [],
  retailProducts: [],
};

export default function AddInvoices({ userProfile }) {
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    price: null,
    quantity: 1,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [matchingProducts, setMatchingProducts] = useState([]);
  const [currentRetailProduct, setCurrentRetailProduct] = useState({
    name: "",
    price: null,
    quantity: 1,
  });
  const [selectedRetailProduct, setSelectedRetailProduct] = useState(null);
  const [matchingRetailProducts, setMatchingRetailProducts] = useState([]);
  const [clientName, setClientName] = useState("");
  const [allInvoiceProductsList, setAllInvoiceProductsList] = useState(null);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const [formData, setFormData] = useState({
    ...initialFormState,
  });
  const [invoiceArray, setInvoiceArray] = useState([]);
  const totalRef = useRef();
  const [isAlert, setIsAlert] = useState({
    retailShow: false,
    productUsedShow: false,
    message: "",
    isClient: false,
    maxInvoice: false,
  });

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const inputValue =
      type === "checkbox" ? checked : isNaN(value) ? value : +value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: inputValue,
    }));

    if (name === "clientName" && !value) {
      setIsAlert({
        isClient: false,
        message: "",
      });
    }
  };

  const removeProduct = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData((prevFormData) => ({
      ...prevFormData,
      products: updatedProducts,
    }));
  };

  const removeRetailProduct = (index) => {
    const updatedProducts = [...formData.retailProducts];
    updatedProducts.splice(index, 1);
    setFormData((prevFormData) => ({
      ...prevFormData,
      retailProducts: updatedProducts,
    }));
  };
  const getTotalPaidByClient = () => {
    let totalPaid = formData.paidByClientCash + formData.paidByClientCredit;
    return totalPaid;
  };

  const getTotalCostPrice = (product) => {
    return +product.cost_price * +product.quantity;
  };

  const getConsumableCostPrice = () => {
    let sum = 0;
    formData.products.forEach((product) => {
      sum += getTotalCostPrice(product);
    });
    return sum;
  };

  const getRetailCostPrice = () => {
    let sum = 0;
    formData.retailProducts.forEach((product) => {
      sum += getTotalCostPrice(product);
    });
    return sum;
  };

  const getTotalRetailPrice = (product) => {
    return +product.retail_price * +product.quantity;
    
  };

  const getConsumableRetailPrice = () => {
    let sum = 0;
    formData.products.forEach((product) => {
      sum += getTotalRetailPrice(product);
    });
    return sum;
  };

  const getRetailRetailPrice = () => {
    let sum = 0;
    formData.retailProducts.forEach((product) => {
      sum += getTotalRetailPrice(product);
    });
    return sum;
  };

  const calculateTax = (amountPaid) => {
    let afterTaxprice = amountPaid - amountPaid * 0.031;
    return afterTaxprice;
  };

  const cashCalculations = (obj) => {
    let cashRemaining = obj.cashRemaining;
    if (cashRemaining >= obj.retailTotal && cashRemaining != 0)
      cashRemaining -= obj.retailTotal;
    else obj.retailTotal = calculateTax(obj.retailTotal);
    if (cashRemaining > obj.discount && cashRemaining != 0)
      cashRemaining -= obj.retailTotal;
    else obj.discount = calculateTax(obj.discount);
    if (cashRemaining >= obj.tip && cashRemaining != 0)
      cashRemaining -= obj.tip;
    else obj.tip = calculateTax(obj.tip);
    if (cashRemaining >= obj.gfeFee && cashRemaining != 0)
      cashRemaining -= obj.gfeFee;
    else obj.gfeFee = calculateTax(obj.gfeFee);
    if (cashRemaining >= obj.semagConsultFee && cashRemaining != 0)
      cashRemaining -= obj.semagConsultFee;
    else obj.semagConsultFee = calculateTax(obj.semagConsultFee);
    return;
  };

  const getOverheadFeeAmount = (total) => {
    if (formData.overheadFeeType === "percentage") {
      return total * (formData.overheadFeeValue / 100);
    } else {
      return formData.overheadFeeValue;
    }
  };

  const getTotal = () => {
    let afterTax = {
      cashRemaining: formData.paidByClientCash,
      tip: formData.tip,
      discount: formData.personalDiscount,
      retailTotal: getRetailCostPrice(),
      conciergeFee: 0,
      gfeFee: 0,
      semagConsultFee: 0
    };
    if (formData?.gfe) {
      afterTax.gfeFee = 30;
      if(userProfile.email === "houstonbeautifulaesthetics@gmail.com") afterTax.gfeFee = afterTax.gfeFee + 10;
    }

    console.log(userProfile.email)
    if (formData?.semaglitudeConsultation) {
      afterTax.semagConsultFee = 75;
    }
    console.log(userProfile.email)
    if (formData?.conciergeFeePaid) {
      afterTax.conciergeFee = 50;
    }
    cashCalculations(afterTax);
    const totalProductPriceSum = getConsumableCostPrice();
    const totalPaidByClientAT =
      formData.paidByClientCash + calculateTax(formData.paidByClientCredit);
    let total =
      (totalPaidByClientAT +
        afterTax.discount -
        afterTax.conciergeFee -
        totalProductPriceSum -
        afterTax.gfeFee -
        afterTax.semagConsultFee -
        afterTax.tip -
        afterTax.retailTotal) *
      (userProfile?.service_percentage / 100); //(replace with injector percentage)
    if (userProfile?.gfe) total += afterTax.gfeFee + afterTax.semagConsultFee;
    total =
      total -
      afterTax.discount + afterTax.tip +
      (afterTax.retailTotal * (parseInt(userProfile?.retail_percentage) || 0)) /
        100 +
      afterTax.conciergeFee;

    if (userProfile?.gfe && formData?.gfe && totalPaidByClientAT === 0){
      total = 30;
      if(userProfile.email === "houstonbeautifulaesthetics@gmail.com") total = total + 10;
    }
    if (userProfile?.gfe && formData?.semaglitudeConsultation && totalPaidByClientAT === 0)
      total = 75;
    if (!userProfile?.gfe && formData?.semaglitudeConsultation && getTotalPaidByClient() === 75)
      total = 0;
    if (!userProfile?.gfe && formData?.gfe && getTotalPaidByClient() === 30) {
      total = 0;
    }
    
    // totalRef.current.charge =
    return total.toFixed(2);
  };

  const getExpectedReplenishIncome = () => {
    let totalRetail = getConsumableRetailPrice() + getRetailCostPrice();
    let totalCost = getConsumableCostPrice() + getRetailCostPrice();
    let expectedIncome = totalRetail - totalCost;
    if ((formData.paidByClientCash = 0))
      expectedIncome = expectedIncome - expectedIncome * 0.031;
    expectedIncome =
      expectedIncome * ((100 - userProfile?.service_percentage) / 100);
    console.log(expectedIncome);
    return expectedIncome;
  };

  const getActualReplenishIncome = () => {
    let injectorPay = getTotal();
    let actualIncome =
      (injectorPay / (userProfile?.service_percentage / 100)) *
      ((100 - userProfile?.service_percentage) / 100);
    console.log(actualIncome);
    return actualIncome;
  };

  const replenishIncomeFlag = () => {
    if (getExpectedReplenishIncome > getActualReplenishIncome) return false;
    else return true;
  };

  /// Product selection functions
  const handleProductNameChange = (e) => {
    const productList = [];
    // change to only user

    userProfile?.employees_inventories.forEach((inventory) => {
      if (
        inventory?.product !== undefined &&
        inventory?.product !== null &&
        inventory?.product !== "" &&
        inventory?.product?.product_type !== undefined
      ) {
        // console.log(product.product_type);
        if (!inventory?.product.product_type.includes("Retail")) {
          productList.push(inventory?.product);
        }
      }
      // change to only user
    });

    const input = e.target.value;
    setCurrentProduct({ name: input, price: 0, quantity: 1 });
    const matchedProducts =
      input === ""
        ? productList
        : productList?.filter((product) =>
            product?.name.toLowerCase().includes(input.toLowerCase())
          );

    // console.log({ matchedProducts });
    setMatchingProducts(matchedProducts);
  };
  const handleProductSelection = (selectedProductName) => {
    // change to only user
    const selectedProduct = userProfile?.employees_inventories?.find(
      (product) => product?.product?.name === selectedProductName
    );
    // console.log({ selectedProduct });
    if (selectedProduct.product) {
      setCurrentProduct({
        name: selectedProduct?.product.name,
        price: selectedProduct?.product.cost_price,
        quantity: 1,
        maxQtantity:
          selectedProduct.quantity -
          Number(
            (allInvoiceProductsList &&
              allInvoiceProductsList?.productQuantities[
                selectedProduct?.product?.id
              ]?.sumofQuantity) ||
              0
          ),
        id: selectedProduct.product?.id,
      });
      setSelectedProduct(selectedProduct?.product);
      setMatchingProducts([]);

      // change to only user
    } else {
      setCurrentProduct({ name: selectedProductName, price: 0, quantity: 1 });
      setSelectedProduct(null);
      setMatchingProducts([]);
    }
  };
  const handleQuantityChange = (e) => {
    setCurrentProduct({ ...currentProduct, quantity: e.target.value });
  };
  const handleAddProduct = () => {
    if (selectedProduct) {
      if (Number(currentProduct?.quantity) <= 0.009) {
        setIsAlert({
          productUsedShow: true,
          message: `Minimum quantity is 0.01`,
        });
        return;
      }
      if (currentProduct?.quantity > currentProduct?.maxQtantity) {
        setIsAlert({
          productUsedShow: true,
          message: `Unable to add ${currentProduct?.name}, as the quantity is exhausted already`,
        });
        return;
      }
      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
      setCurrentProduct({ name: "", price: 0, quantity: 1 });
      let productToBeAdded = {
        ...selectedProduct,
        quantity: currentProduct.quantity,
      };
      // console.log("productToBeAdded", productToBeAdded);
      setSelectedProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        ["products"]: [...formData.products, productToBeAdded],
      }));
    }
  };

  ///Retail Product selection functions
  const handleRetailProductNameChange = (e) => {
    const retailProductList = [];
    // change to only user

    userProfile?.employees_inventories.forEach((inventory) => {
      if (
        inventory?.product !== undefined &&
        inventory?.product !== null &&
        inventory?.product !== "" &&
        inventory?.product?.product_type !== undefined
      ) {
        // console.log(product.product_type);
        if (inventory?.product.product_type.includes("Retail")) {
          retailProductList.push(inventory?.product);
        }
      }
      // change to only user
    });

    const input = e.target.value;
    setCurrentRetailProduct({ name: input, price: 0, quantity: 1 });
    const matchedProducts =
      input === ""
        ? retailProductList
        : retailProductList?.filter((product) =>
            product?.name.toLowerCase().includes(input.toLowerCase())
          );

    // console.log({ matchedProducts });
    setMatchingRetailProducts(matchedProducts);
  };
  const handleRetailProductSelection = (selectedRetailProductName) => {
    const selectedProduct = userProfile?.employees_inventories?.find(
      (product) => product?.product?.name === selectedRetailProductName
    );
    if (selectedProduct) {
      setCurrentRetailProduct({
        name: selectedProduct?.product.name,
        price: selectedProduct?.product.cost_price,
        quantity: 1,
        maxQtantity:
          selectedProduct.quantity -
          Number(
            (allInvoiceProductsList &&
              allInvoiceProductsList?.productQuantities[
                selectedProduct?.product?.id
              ]?.sumofQuantity) ||
              0
          ),
        id: selectedProduct.product?.id,
      });
      setSelectedRetailProduct(selectedProduct?.product);
      setMatchingRetailProducts([]);
    } else {
      setCurrentRetailProduct({
        name: selectedRetailProductName,
        price: 0,
        quantity: 1,
      });
      setSelectedRetailProduct(null);
      setMatchingRetailProducts([]);
    }
  };

  const handleRetailQuantityChange = (e) => {
    const quantity = parseFloat(e.target.value);
    setCurrentRetailProduct({ ...currentRetailProduct, quantity });
  };

  const handleAddRetailProduct = () => {
    if (selectedRetailProduct) {
      if (Number(currentRetailProduct?.quantity) <= 0.009) {
        setIsAlert({
          retailShow: true,
          message: `Minimum quantity is 0.01`,
        });
        return;
      }
      if (currentRetailProduct?.quantity > currentRetailProduct?.maxQtantity) {
        setIsAlert({
          retailShow: true,
          message: `Unable to add ${currentRetailProduct?.name}, as the quantity is exhausted already`,
        });
        return;
      }
      setCurrentRetailProduct({ name: "", price: 0, quantity: 1 });
      let retailProductToBeAdded = {
        ...selectedRetailProduct,
        quantity: currentRetailProduct.quantity,
      };
      setSelectedRetailProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        retailProducts: [...formData.retailProducts, retailProductToBeAdded],
      }));

      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
    }
  };

  const handleDeleteInvoice = (id) => {
    const filterArr = invoiceArray.filter((invoice) => invoice.id !== id);
    setAllInvoiceProductsList(calculateProductQuantities(filterArr));
    setInvoiceArray(filterArr);
    setIsAlert({
      productUsedShow: false,
      retailShow: false,
      message: "",
    });
    setCurrentProduct({ name: "", price: 0, quantity: 1 });
    setCurrentRetailProduct({ name: "", price: 0, quantity: 1 });
  };

  function calculateProductQuantities(data) {
    const productQuantities = {};
    const retailProductQuantities = {};

    function calculateQuantities(arr, quantityMap) {
      for (const product of arr) {
        const { id, name, quantity } = product;
        if (quantityMap[id]) {
          // quantityMap[id].sumofQuantity += quantity;
          quantityMap[id].sumofQuantity =
            Number(quantityMap[id].sumofQuantity) + Number(quantity);
        } else {
          quantityMap[id] = {
            product_name: name,
            id,
            sumofQuantity: Number(quantity),
          };
        }
      }
    }

    for (const obj of data) {
      calculateQuantities(obj.products, productQuantities);
      calculateQuantities(obj.retail_products, retailProductQuantities);
    }

    return { productQuantities, retailProductQuantities };
  }

  const addMoreInvoice = (submit) => {
    // clientName
    if (!clientName) {
      setIsAlert({
        isClient: true,
        message: "Please Add Client Name",
      });
      return;
    }
    let invoice = {
      employee_id: userProfile.id,
      user_name: userProfile?.name,
      clientname: clientName,

      date_of_service: formData?.dateOfService,
      concierge_fee_paid: formData?.conciergeFeePaid,
      gfe: formData?.gfe,
      semag_consult_fee: formData?.semaglitudeConsultation,
      paid_by_client_cash: formData?.paidByClientCash,
      paid_by_client_credit: formData?.paidByClientCredit,
      personal_discount: formData?.personalDiscount,
      tip: formData?.tip,
      comments: formData?.comments,
      products: formData.products,
      retail_products: formData.retailProducts,
      charge: Number(getTotal()).toFixed(2),
      expected_income: getExpectedReplenishIncome(),
      actual_income: getActualReplenishIncome(),
      income_flag: replenishIncomeFlag(),
      get_total_price_by_client: getTotalPaidByClient(),
      total_consumable_cost: getConsumableCostPrice(),
    };
    const invoiceList = [
      ...invoiceArray,
      {
        ...invoice,
        id: Date.now(),
      },
    ];

    setAllInvoiceProductsList(() => calculateProductQuantities(invoiceList));

    if (invoiceList?.length >= 4) {
      setIsAlert({
        maxInvoice: true,
        message: `You Can Not Add More then 5 Invoice`,
      });

      setTimeout(() => {
        setIsAlert({
          maxInvoice: false,
          message: ``,
        });
      }, 5000);
    }
    if (submit === "submit") {
      return invoiceList;
    } else {
      setInvoiceArray(invoiceList);
      setFormData(initialFormState);
      setCurrentProduct({ name: "", price: 0, quantity: 1 });
      setSelectedProduct(null);
      setMatchingProducts([]);
      setClientName("");

      window.scrollTo({
        top: document.body.scrollHeight + 500,
        behavior: "smooth",
      });

      return invoice;
    }
  };

  // console.log((currentProduct.quantity * currentProduct.price).toFixed(2));

  const handleSubmit = (event) => {
    setSubmitButtonDisabled(true);
    event.preventDefault();
    const invoiceData = addMoreInvoice("submit");

    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure add ${invoiceData?.length} Invoices `,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch("/api/invoice_groups/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              // for single invoice
              // body: JSON.stringify(invoice),
              // for multiple invoice
              body: JSON.stringify(invoiceData),
            })
              .then((res) => {
                if (res.ok) {
                  toast.success("Invoice created successfully.");
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                } else if (res.status === 404) {
                  res.json().then((json) => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to create Invoice");
                  });
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                toast.error("An error occured.");
              });

            setFormData(initialFormState);
            setCurrentProduct({ name: "", price: 0, quantity: 1 });
            setSelectedProduct(null);
            setMatchingProducts([]);
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
    setSubmitButtonDisabled(true);
  };

  return (
    <>
      <Header userProfile={userProfile} />

      <div className="bg-blue-200 p-1 sm:p-4 ">
        <div className="bg-blue-200 min-h-screen pb-8 flex items-center justify-center flex-col md:p-4">
          {isAlert.maxInvoice && (
            <Alert variant="warning">{isAlert.message}</Alert>
          )}
          <form
            className="max-w-full md:max-w-4xl mx-auto bg-white md:p-4 rounded-md"
            onSubmit={handleSubmit}
          >
            <div className="flex justify-end  mr-4 my-2 ">
              <Button
                onClick={() => {
                  addMoreInvoice(true);
                }}
                disabled={invoiceArray?.length >= 4}
              >
                Add Client
              </Button>
            </div>
            <div className="border rounded-sm p-2 mb-4 flex flex-wrap justify-start md:justify-around">
              <div className="text-center">
                <h4>Provider:</h4>
                <div>{userProfile?.name}</div>
              </div>
              <div className="flex gap-4 mt-2 md:mt-0">
                <label className=" mb-3 block relative">
                  Client Name:
                  <input
                    type="text"
                    name="clientName"
                    placeholder={
                      isAlert.isClient === true ? isAlert.message : undefined
                    }
                    id="clientName"
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    autoComplete="off"
                    className="w-full placeholder:text-red-600 mt-1 p-1 border-gray-300 border rounded-md"
                    required
                  />
                </label>

                <label className="mb-2 block">
                  Date of Service:
                  <input
                    type="date"
                    name="dateOfService"
                    value={formData.dateOfService}
                    onChange={(event) => handleInputChange(event)}
                    className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                  />
                </label>
              </div>
            </div>
            <div
              style={{
                gridTemplateColumns: "1fr 2fr",
                gap: "20px",
              }}
              className="flex flex-col-reverse md:grid"
            >
              <div className=" pb-4 md:pb-1 px-2">
                <div className="border rounded-sm p-2 mb-4 w-100">
                  <label className="mb-2 block">
                    Concierge Fee Paid:
                    <input
                      type="checkbox"
                      name="conciergeFeePaid"
                      checked={formData.conciergeFeePaid}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-1"
                    />
                  </label>
                  <label className="block">
                    GFE:
                    <input
                      type="checkbox"
                      name="gfe"
                      checked={formData?.gfe}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-2"
                    />
                  </label>
                  <label className="block">
                    Semaglitude Consulation:
                    <input
                      type="checkbox"
                      name="semaglitudeConsultation"
                      checked={formData?.semaglitudeConsultation}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-2"
                    />
                  </label>
                  <label className="mb-2 block">
                    Paid by Client Cash:
                    <input
                      type="number"
                      name="paidByClientCash"
                      value={Number(formData.paidByClientCash).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                  <label className="mb-2 block">
                    Paid by Client Credit:
                    <input
                      type="number"
                      name="paidByClientCredit"
                      value={Number(formData.paidByClientCredit).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                  <label className="block">
                    Total paid by client: {getTotalPaidByClient()}
                  </label>
                </div>
                <div className="border rounded-sm p-2 mb-4 w-100">
                  <label className="mb-2 block">
                    Personal Discount:
                    <input
                      type="number"
                      name="personalDiscount"
                      value={Number(formData.personalDiscount).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                  <label className="mb-2 block">
                    Tip:
                    <input
                      type="number"
                      name="tip"
                      // value={Number(formData.tip).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                </div>
                <div className="border rounded-sm p-2 mb-4">
                  <label className="mb-2 block ">
                    Comments:
                    <input
                      type="text"
                      name="comments"
                      value={formData.comments}
                      onChange={(event) => handleInputChange(event)}
                      className="w-full p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                </div>
                <div className="border rounded-sm p-2 mb-4 w-100">
                  <label className="block">
                    Total:
                    <span ref={totalRef}>{Number(getTotal()).toFixed(2)}</span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={submitButtonDisabled}
                  className="w-full md:hidden bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Submit
                </button>
              </div>
              <div className="px-2">
                <div className="border overflow-x-auto rounded-sm p-2 mb-4 products-used">
                  <table className="w-full table-auto ">
                    <thead className="whitespace-normal">
                      <tr>
                        <th>Products/Services</th>
                        <th>Product Quantity</th>
                        <th>Price</th>
                        <th>Total Price</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="whitespace-normal">
                      <tr key={1}>
                        <td>
                          <input
                            type="text"
                            name="productName"
                            id="product_name"
                            placeholder="Select Product Name"
                            autoComplete="off"
                            value={currentProduct?.name}
                            onClick={handleProductNameChange}
                            onChange={handleProductNameChange}
                            className="w-full p-1 border-gray-500 border rounded-md"
                          />
                          {matchingProducts?.length >= 0 && (
                            <div className="absolute bg-white w-sm max-h-40 overflow-y-auto rounded-md mt-1 shadow-md">
                              {matchingProducts
                                ?.filter(
                                  (item1) =>
                                    !formData?.products.some(
                                      (item2) => item2?.name === item1?.name
                                    )
                                )
                                ?.map((product) => (
                                  <p
                                    key={product.id}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() =>
                                      handleProductSelection(product?.name)
                                    }
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
                            step="0.01"
                            name="productQuantity"
                            placeholder={`max:${currentProduct?.maxQtantity}`}
                            value={currentProduct.quantity}
                            onChange={(e) => {
                              setIsAlert({
                                productUsedShow: false,
                                retailShow: false,
                                message: "",
                              });
                              +e.target.value <= currentProduct?.maxQtantity
                                ? handleQuantityChange(e)
                                : setIsAlert({
                                    productUsedShow: true,
                                    message: ` You can only select quantity upto ${currentProduct?.maxQtantity} for ${currentProduct?.name}`,
                                  });
                            }}
                            min={0.01}
                            max={currentProduct?.maxQtantity?.toFixed(2)}
                            className="w-full p-1 
                          border-gray-300 border rounded-md"
                          />
                        </td>
                        <td>
                          <input
                            type="string"
                            name="productPrice"
                            autoComplete="off"
                            value={currentProduct.price}
                            className="w-full p-1 border-gray-300 border rounded-md"
                          />
                        </td>
                        <td>
                          {Number(
                            currentProduct.quantity * currentProduct.price || 0
                          )?.toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={handleAddProduct}
                            className={`${
                              selectedProduct
                                ? "text-green-500 border-green-500"
                                : "text-gray-500 border-gray-500"
                            } border-2 px-2`}
                            disabled={!selectedProduct}
                          >
                            &#x2713;
                          </button>
                        </td>
                      </tr>
                      {formData.products?.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product?.name}
                            </p>
                          </td>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {Number(product.quantity || 0).toFixed(2)}
                            </p>
                          </td>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product.cost_price}
                            </p>
                          </td>
                          <td>
                            {Number(
                              product.quantity * product.cost_price || 0
                            )?.toFixed(2)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeProduct(index)}
                              className="text-red-500   border-2 border-red-500 px-2"
                            >
                              &#10005;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isAlert.productUsedShow && (
                    <span className="text-sm">{isAlert?.message}</span>
                  )}
                </div>
                <div className="border rounded-sm p-2 overflow-x-auto mb-4 retail-products">
                  <table className="w-full table-autol">
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
                      <tr>
                        <td>
                          <input
                            type="text"
                            name="productName"
                            id="retail_product_name"
                            autoComplete="off"
                            value={currentRetailProduct?.name}
                            onClick={handleRetailProductNameChange}
                            onChange={handleRetailProductNameChange}
                            className="w-full p-1 border-gray-500 border rounded-md"
                            // required
                          />
                          {matchingRetailProducts?.length > 0 && (
                            <div className="absolute bg-white w-sm max-h-40 overflow-y-auto rounded-md mt-1 shadow-md">
                              {matchingRetailProducts
                                ?.filter(
                                  (item1) =>
                                    !formData?.retailProducts.some(
                                      (item2) => item2?.name === item1?.name
                                    )
                                )
                                ?.map((product) => (
                                  <p
                                    key={product.id}
                                    className="p-2 cursor-pointer hover:bg-gray-100"
                                    onClick={() =>
                                      handleRetailProductSelection(
                                        product?.name
                                      )
                                    }
                                  >
                                    {product?.name}
                                  </p>
                                ))}
                            </div>
                          )}
                        </td>
                        <td className="">
                          <input
                            type="number"
                            name="productQuantity"
                            step="0.01"
                            placeholder={`max:${currentRetailProduct?.maxQtantity}`}
                            value={currentRetailProduct.quantity}
                            onChange={(e) => {
                              setIsAlert({
                                productUsedShow: false,
                                retailShow: false,
                                message: "",
                              });
                              +e.target.value <=
                              currentRetailProduct?.maxQtantity
                                ? handleRetailQuantityChange(e)
                                : setIsAlert({
                                    retailShow: true,
                                    message: ` Your can select upto ${currentRetailProduct?.maxQtantity} quantity`,
                                  });
                            }}
                            min="0"
                            max={currentRetailProduct?.maxQtantity?.toFixed(2)}
                            className="w-full p-1 border-gray-300 border rounded-md"
                          />
                        </td>
                        <td>
                          <input
                            type="string"
                            name="productPrice"
                            autoComplete="off"
                            value={currentRetailProduct.price}
                            className="w-full p-1 border-gray-300 border rounded-md"
                          />
                        </td>
                        <td>
                          {Number(
                            currentRetailProduct.quantity *
                              currentRetailProduct.price || 0
                          )?.toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={handleAddRetailProduct}
                            className={`${
                              selectedRetailProduct
                                ? "text-green-500 border-green-500"
                                : "text-gray-500 border-gray-500"
                            } border-2 px-2`}
                            disabled={!selectedRetailProduct}
                          >
                            &#x2713;
                          </button>
                        </td>
                      </tr>

                      {formData.retailProducts.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product?.name}
                            </p>
                          </td>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product.quantity}
                            </p>
                          </td>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product.cost_price}
                            </p>
                          </td>
                          <td>{product.quantity * product.cost_price}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeRetailProduct(index)}
                              className="text-red-500   border-2 border-red-500 px-2"
                            >
                              &#10005;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isAlert.retailShow && (
                    <span className="text-sm">{isAlert?.message}</span>
                  )}
                </div>
                <div className="border rounded-sm p-2 mb-4">
                  <label className="block">
                    Total Product Price Sum:{" "}
                    {Number(getConsumableCostPrice() || 0)?.toFixed(2)}
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full hidden md:block bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          {invoiceArray?.length > 0 &&
            invoiceArray?.map((invoice) => {
              // console.log({ invoice });
              return (
                <AddInvoiceTemplate
                  key={invoice.id}
                  id={invoice.id}
                  user={invoice.user_name}
                  employee_id={invoice.employee_id}
                  clientname={invoice.clientname}
                  dateOfService={invoice?.date_of_service}
                  conciergeFeePaid={invoice?.concierge_fee_paid}
                  gfe={invoice?.gfe}
                  semaglitudeConsultation={invoice?.semag_consult_fee}
                  paidByClientCash={invoice?.paid_by_client_cash}
                  paidByClientCredit={invoice?.paid_by_client_credit}
                  personalDiscount={invoice?.personal_discount}
                  tip={invoice?.tip}
                  comments={invoice?.comments}
                  products={invoice.products}
                  retailProducts={invoice.retail_products}
                  charge={invoice.charge}
                  getTotalPriceByClient={invoice.get_total_price_by_client}
                  totalConsumableCost={invoice.total_consumable_cost}
                  actual_income={invoice.actual_income}
                  income_flag={invoice.income_flag}
                  expected_income={invoice.expected_income}
                  handleDeleteInvoice={handleDeleteInvoice}
                />
              );
            })}
        </div>
      </div>
    </>
  );
}
