/* eslint-disable eqeqeq */
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Table } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert"; // Import
import { toast } from "react-toastify";
import { LOGIN } from "../Constants/AuthConstants";
import {
  CreateClient,
  createGroupInvoices,
  getClients,
  getInvoiceList,
  getUpdatedUserProfile,
} from "../Server";
import AddInvoiceTemplate from "../components/AddInvoiceTemplate";
import Loadingbutton from "../components/Buttons/Loadingbutton";
// import BeforeAfterMediaModal from "../components/Modals/BeforeAfterMediaModal";
import { useAuthContext } from "../context/AuthUserContext";
import { MdOutlineCancel } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import Select from "react-select";

const initialFormState = {
  clientName: "",
  dateOfService: "",
  conciergeFeePaid: false,
  gfe: false,
  semaglitudeConsultation: false,
  provider_purchased: false,
  paidByClientCash: 0,
  paidByClientCredit: 0,
  personalDiscount: 0,
  tip: 0,
  comments: "",
  products: [],
  retailProducts: [],
};

export default function AddInvoices() {
  const { authUserState, authUserDispatch } = useAuthContext();
  const [currentProduct, setCurrentProduct] = useState({
    name: "",
    price: 0,
    quantity: 1,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [matchingProducts, setMatchingProducts] = useState([]);
  const [currentRetailProduct, setCurrentRetailProduct] = useState({
    name: "",
    price: 0,
    quantity: 1,
  });
  const suggestProductListRef = useRef(null);
  const suggestRetailProductListRef = useRef(null);
  const [selectedRetailProduct, setSelectedRetailProduct] = useState(null);
  const [matchingRetailProducts, setMatchingRetailProducts] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [allInvoiceProductsList, setAllInvoiceProductsList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [retailProductList, setRetailProductList] = useState([]);
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
  const [showModal, setShowModal] = useState(false);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);

  const [blobsForBefore, setBlobForBefore] = useState([]);
  const [blobsForAfter, setBlobForAfter] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [client, setClient] = useState();
  const [clientPayload,setClientPayload]=useState({
    name:"",
    last_name:"",
    email:""
  })
  const [createClient,setCreateClient]=useState(false)

  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getClients();
      if (data?.length > 0) {        
        const newData = data.filter(
          (client) =>
            client?.email !== null &&
            client?.email !== undefined &&
            client?.email.trim() !== ""
        );
        setEmployeeList(newData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEmployees()
    const newProducts = []
    authUserState.user?.employees_inventories.forEach((inventory, index) => {
      if (
        inventory?.product !== undefined &&
        inventory?.product !== null &&
        inventory?.product !== "" &&
        inventory?.product?.product_type !== undefined
      ) {
        if (!inventory?.product.product_type.includes("Retail")) {
          newProducts.push({ ...inventory?.product, label: inventory?.product.name, value: index });
        }
      }
      // change to only user
    });
    setProductList(newProducts);
    const newRetailProductList = [];
    // change to only user

    authUserState.user?.employees_inventories.forEach((inventory, index) => {
      if (
        inventory?.product !== undefined &&
        inventory?.product !== null &&
        inventory?.product !== "" &&
        inventory?.product?.product_type !== undefined
      ) {
        if (inventory?.product.product_type.includes("Retail")) {
          newRetailProductList.push({ ...inventory?.product, label: inventory?.product.name, value: index });
        }
      }
      // change to only user
    });
    setRetailProductList(newRetailProductList)
    const handleClickOutside = (event) => {
      if (
        suggestProductListRef.current &&
        !suggestProductListRef.current.contains(event.target)
      ) {
        setMatchingProducts([]);
      }

      if (
        suggestRetailProductListRef.current &&
        !suggestRetailProductListRef.current.contains(event.target)
      ) {
        setMatchingRetailProducts([]);
      }
    };
    // Add the event listener when the component mounts.
    document.addEventListener("click", handleClickOutside);

    // Remove the event listener when the component unmounts.
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleProductListChange = async (selectedOption) => {
    setSelectedProduct(selectedOption);
    if (selectedOption) {
      if (Number(selectedOption?.quantity) <= 0.009) {
        setIsAlert({
          productUsedShow: true,
          message: `Minimum quantity is 0.01`,
        });
        return;
      }
      if (selectedOption?.quantity > selectedOption?.maxQtantity) {
        setIsAlert({
          productUsedShow: true,
          message: `Unable to add ${selectedOption?.name}, as the quantity is exhausted already`,
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
        ...selectedOption,
        quantity: 1,
      };
      setSelectedProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        products: [...formData.products, productToBeAdded],
      }));
      const newValues = productList.filter(obj => obj.id !== selectedOption.id);
      setProductList([...newValues])
    }
    // const { data } = await getLocationEmployee(selectedOption?.id);
    // if (data?.length > 0) {
    //   setEmployeeList(data);
    //   setSelectedEmployeeData(null);
    // }
  };

  const handleRetailProductListChange = async (selectedOption) => {
    setSelectedRetailProduct(selectedOption)
    if (selectedOption) {
      if (Number(selectedOption?.quantity) <= 0.009) {
        setIsAlert({
          retailShow: true,
          productUsedShow: false,
          message: `Minimum quantity is 0.01`,
        });
        return;
      }
      if (selectedOption?.quantity > selectedOption?.maxQtantity) {
        setIsAlert({
          retailShow: true,
          message: `Unable to add ${selectedOption?.name}, as the quantity is exhausted already`,
        });
        return;
      }

      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
      setCurrentRetailProduct({ name: "", price: 0, quantity: 1 });
      let retailProductToBeAdded = {
        ...selectedOption,
        quantity: 1,
      };
      setSelectedRetailProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        retailProducts: [...formData.retailProducts, retailProductToBeAdded],
      }));
      const newValues = retailProductList.filter(obj => obj.id !== selectedOption.id);
      setRetailProductList([...newValues])

      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
    }
  };

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

  const removeProduct = (index, product) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData((prevFormData) => ({
      ...prevFormData,
      products: updatedProducts,
    }));
    setProductList([...productList, product]);
  };

  const removeRetailProduct = (index, product) => {
    const updatedProducts = [...formData.retailProducts];
    updatedProducts.splice(index, 1);
    setFormData((prevFormData) => ({
      ...prevFormData,
      retailProducts: updatedProducts,
    }));
    setRetailProductList([...retailProductList, product]);
  };
  const getTotalPaidByClient = () => {
    let totalPaid = formData.paidByClientCash + formData.paidByClientCredit;
    return totalPaid;
  };

  const getTotalCostPrice = (product) => {
    return +product.cost_price * +product.quantity;
  };

  const getTotalRetailPrice = (product) => {
    return +product.retail_price * +product.quantity;
  };

  const getConsumableCostPrice = () => {
    let sum = 0;
    formData.products.forEach((product) => {
      sum += getTotalCostPrice(product);
    });
    return sum;
  };

  const getProviderPurchasedCostPrice = () => {
    let sum = 0;
    formData.products.forEach((product) => {
      if(product.provider_purchased){
        sum += getTotalCostPrice(product);
      }
    });
    return sum;
  };

  const getConsumableRetailPrice = () => {
    let sum = 0;
    formData.products.forEach((product) => {
      sum += getTotalRetailPrice(product);
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

  // eslint-disable-next-line no-unused-vars
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
      retailTotal: getRetailRetailPrice(),
      conciergeFee: 0,
      gfeFee: 0,
      semagConsultFee: 0,
    };
    if (formData?.gfe) {
      afterTax.gfeFee = 20;
      if (authUserState.user?.email === "houstonbeautifulaesthetics@gmail.com")
        afterTax.gfeFee = afterTax.gfeFee + 10;
    }

    if (formData?.semaglitudeConsultation) {
      // Calculate semaglutide fee based on 20% of the gross client payment
      const grossClientPayment = formData.paidByClientCash + formData.paidByClientCredit;
      const semaglutideFee = grossClientPayment * 0.2
      // afterTax.semagConsultFee = 5000
    }

    if (formData?.conciergeFeePaid) {
      afterTax.conciergeFee = 50;
    }
    cashCalculations(afterTax);
    const totalProductPriceSum = getConsumableCostPrice();
    const totalPaidByClientAT =
      formData.paidByClientCash + calculateTax(formData.paidByClientCredit);

    const selected_product_types = formData.products.map((product) => {
      return product?.product_type;
    });

    const semaglitude_percentage =
      selectedProduct?.product_type === "Semaglitude" ||
        selected_product_types.includes("Semaglitude") || formData?.semaglitudeConsultation
        ? 20
        : authUserState.user?.service_percentage;

    let total =
      (totalPaidByClientAT +
        afterTax.discount -
        afterTax.conciergeFee -
        totalProductPriceSum -
        afterTax.gfeFee -
        afterTax.semagConsultFee -
        afterTax.tip -
        afterTax.retailTotal) *
      (semaglitude_percentage / 100); //(replace with injector percentage)

    formData?.products.forEach((product) => {
      if(product?.provider_purchased) total += getProviderPurchasedCostPrice();
    })

    if (authUserState.user?.gfe)
      total += afterTax.gfeFee + afterTax.semagConsultFee;
    total =
      total -
      afterTax.discount +
      afterTax.tip +
      (afterTax.retailTotal *
        (parseInt(authUserState.user?.retail_percentage) || 0)) /
      100 +
      afterTax.conciergeFee;

    if (authUserState.user?.gfe && formData?.gfe && totalPaidByClientAT === 0) {
      total = 20;
      if (authUserState.user.email === "houstonbeautifulaesthetics@gmail.com")
        total = total + 20;
    }
    if (
      authUserState.user?.gfe &&
      formData?.semaglitudeConsultation &&
      totalPaidByClientAT === 0
    )
      total = 0;
    if (
      !authUserState.user?.gfe &&
      formData?.semaglitudeConsultation &&
      getTotalPaidByClient() === 75
    )
      total = 0;
    if (
      !authUserState.user?.gfe &&
      formData?.gfe &&
      getTotalPaidByClient() === 30
    ) {
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
      expectedIncome * ((100 - authUserState.user?.service_percentage) / 100);
    return expectedIncome;
  };

  const getActualReplenishIncome = () => {
    let injectorPay = getTotal();
    let actualIncome =
      (injectorPay / (authUserState.user?.service_percentage / 100)) *
      ((100 - authUserState.user?.service_percentage) / 100);
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

    authUserState.user?.employees_inventories.forEach((inventory) => {
      if (
        inventory?.product !== undefined &&
        inventory?.product !== null &&
        inventory?.product !== "" &&
        inventory?.product?.product_type !== undefined
      ) {
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
    setMatchingProducts(matchedProducts);
  };
  const handleProductSelection = (selectedProductName) => {
    // change to only user
    const selectedProduct = authUserState.user?.employees_inventories?.find(
      (product) => product?.product?.name === selectedProductName
    );
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
      handleAddProduct();
      setMatchingProducts([]);

      // change to only user
    } else {
      setCurrentProduct({ name: selectedProductName, price: 0, quantity: 1 });
      setSelectedProduct(null);
      setMatchingProducts([]);
    }
  };
  const handleQuantityChange = (e, product) => {
    function changeObjectPropertyValue(objectId, propertyName, newValue) {
      let objectIndex = formData.products.findIndex(obj => obj.id === objectId); // Find the index of the object by its ID
      if (objectIndex !== -1) { // If object is found
        formData.products[objectIndex][propertyName] = newValue; // Change the property value
      }
    }
    changeObjectPropertyValue(product.id, 'quantity', e.target.value);
    // setFormData({ ...formData, quantity: e.target.value });
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
      setSelectedProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        products: [...formData.products, productToBeAdded],
      }));
    }
  };

  ///Retail Product selection functions
  const handleRetailProductNameChange = (e) => {
    const retailProductList = [];
    // change to only user

    authUserState.user?.employees_inventories.forEach((inventory) => {
      if (
        inventory?.product !== undefined &&
        inventory?.product !== null &&
        inventory?.product !== "" &&
        inventory?.product?.product_type !== undefined
      ) {
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

    setMatchingRetailProducts(matchedProducts);
  };
  const handleRetailProductSelection = (selectedRetailProductName) => {
    const selectedProduct = authUserState.user?.employees_inventories?.find(
      (product) => product?.product?.name === selectedRetailProductName
    );

    if (selectedProduct.product) {
      setCurrentRetailProduct({
        name: selectedProduct?.product.name,
        price: selectedProduct?.product.cost_price,
        quantity: 1,
        maxQtantity:
          selectedProduct.quantity -
          Number(
            (allInvoiceProductsList &&
              allInvoiceProductsList?.retailProductQuantities[
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

  const handleRetailQuantityChange = (e, product) => {
    function changeObjectPropertyValue(objectId, propertyName, newValue) {
      let objectIndex = formData.retailProducts.findIndex(obj => obj.id === objectId); // Find the index of the object by its ID
      if (objectIndex !== -1) { // If object is found
        formData.retailProducts[objectIndex][propertyName] = newValue; // Change the property value
      }
    }
    changeObjectPropertyValue(product.id, 'quantity', e.target.value);
    // setFormData({ ...formData, quantity: e.target.value });
    // const quantity = parseFloat(e.target.value);
    // setCurrentRetailProduct({ ...currentRetailProduct, quantity });
  };

  const handleAddRetailProduct = () => {
    if (selectedRetailProduct) {
      if (Number(currentRetailProduct?.quantity) <= 0.009) {
        setIsAlert({
          retailShow: true,
          productUsedShow: false,
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

      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
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
      employee_id: authUserState.user.id,
      user_name: authUserState.user?.name,
      clientname: clientName,
      lastname:clientName,
      email:clientName,
      beforeImages: blobsForBefore,
      afterImages: blobsForAfter,

      date_of_service: formData?.dateOfService,
      concierge_fee_paid: formData?.conciergeFeePaid,
      gfe: formData?.gfe,
      semag_consult_fee: formData?.semaglitudeConsultation,
      provider_purchased: formData?.provider_purchased,
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
      total_consumable_cost: getConsumableRetailPrice(),
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
      setAfterImages([]);
      setBeforeImages([]);
      setBlobForAfter([]);
      setBlobForBefore([]);

      window.scrollTo({
        top: document.body.scrollHeight + 500,
        behavior: "smooth",
      });

      return invoice;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const invoiceData = addMoreInvoice("submit");
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure add ${invoiceData?.length} Invoices `,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              await createGroupInvoices(invoiceData);
              toast.success("Invoice created successfully.");
              await getInvoiceList(true);
              const { data: useData } = await getUpdatedUserProfile(true);
              authUserDispatch({ type: LOGIN, payload: useData });

              setClientName("");
              setInvoiceArray([]);
              setFormData(initialFormState);
              setCurrentProduct({ name: "", price: 0, quantity: 1 });
              setSelectedProduct(null);
              setMatchingProducts([]);
              setAfterImages([]);
              setBeforeImages([]);
              setBlobForAfter([]);
              setBlobForBefore([]);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                error?.response?.statusText ||
                error.message ||
                "Failed to create Invoice"
              );
            } finally {
              setLoading(false);
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
  function findProductQuantity(data, productId) {
    let quantity = 0;

    // Iterate through the array of objects
    data.forEach(item => {
      // Check if the product id matches the specified productId
      if (item.product.id === productId) {
        quantity += item.quantity; // Add the quantity of the matching product
      }
    });

    return quantity;
  }

  const handleClientChange = (event) => {
    setClient(event.target.value);
    let selectedClient = employeeList.find((client) => client.name === event.target.value);
    setSelectedClient(selectedClient);
    setClientName(selectedClient.name)
    setClientLastName(selectedClient.last_name)
    setClientEmail(selectedClient.email)
  };

  const handleCreateClientCheckbox = (event) => {
    setCreateClient(event.target.checked)
  };

  return (
    <>
      {/* <Header /> */}

      <div className="bg-blue-200 p-1 sm:p-4 ">
        <div className="bg-blue-200 min-h-screen pb-8 flex items-center justify-center flex-col md:p-4">
          {isAlert.maxInvoice && (
            <Alert variant="warning">{isAlert.message}</Alert>
          )}
          <form className=" bg-white md:p-4 rounded-md" onSubmit={handleSubmit}>
            <div className="flex justify-end  mr-4 my-2 ">
              <Button
                onClick={() => {
                  addMoreInvoice(true);
                }}
                className="!bg-cyan-400 !border-cyan-500 hover:!bg-cyan-500 focus:!bg-cyan-500"
                disabled={invoiceArray?.length >= 4}
              >
                Add Client
              </Button>
            </div>
            <div className="border rounded-lg gap-4 p-2 py-4 items-center mb-4 mt-4 flex flex-col flex-wrap justify-center md:flex-row md:justify-around">
              <div className="text-center">
                <h4>Provider:</h4>
                <div>{authUserState.user?.name}</div>
              </div>
              <div className="flex flex-col w-full gap-4 mt-2 md:w-auto md:mt-0 md:flex-row">
                {/* <label className=" mb-3 block relative">
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
                </label> */}

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
                <div className="border flex flex-col gap-3 rounded-lg p-2 mb-4 w-100">
                  <label className=" flex justify-between font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                    Concierge Fee Paid:
                    <input
                      type="checkbox"
                      name="conciergeFeePaid"
                      checked={formData.conciergeFeePaid}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-1"
                    />
                  </label>

                  {/* <label className="flex justify-between font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                    Provider Purchased:
                    <input
                      type="checkbox"
                      name="provider_purchased"
                      checked={formData?.provider_purchased}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-2"
                    />
                  </label> */}

                  {/* <label className="mb-2 block">
                    Provider Purchased:
                    <input
                      type="checkbox"
                      name="providerPurchased"
                      checked={formData.providerPurchased}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-1"
                    />
                  </label> */}
                  <label className="flex justify-between font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                    GFE:
                    <input
                      type="checkbox"
                      name="gfe"
                      checked={formData?.gfe}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-2"
                    />
                  </label>
                  <label className="flex justify-between font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                    Semaglitude:
                    <input
                      type="checkbox"
                      name="semaglitudeConsultation"
                      disabled={(formData.products.length > 0 || formData.retailProducts.length > 0) ? true : false}
                      checked={formData?.semaglitudeConsultation}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-2"
                    />
                  </label>



                  <div className="border-t-[1px]"></div>
                  <label className="mb-2 block font-medium px-2">
                    Paid by Client Cash:
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      name="paidByClientCash"
                      value={Number(formData.paidByClientCash).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                  <label className="mb-2 block font-medium px-2">
                    Paid by Client Credit:
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      name="paidByClientCredit"
                      value={Number(formData.paidByClientCredit).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                  <label className="block font-medium px-2">
                    Total paid by client: {getTotalPaidByClient()}
                  </label>
                </div>
                <div className="border rounded-lg p-2 mb-4 w-100">
                  <label className="mb-2 block font-medium p-2">
                    Personal Discount:
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      name="personalDiscount"
                      value={Number(formData.personalDiscount).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                  <label className="mb-2 block font-medium p-2">
                    Tip:
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      name="tip"
                      placeholder="0.00"
                      // value={Number(formData.tip).toString()}
                      min="0"
                      onChange={(event) => handleInputChange(event)}
                      className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                    />
                  </label>
                </div>
                <div className="border rounded-lg p-2 mb-4">
                  <label className="mb-2 block font-medium p-2">
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
                <div className="border rounded-lg p-2 mb-4 w-100">
                  <label className="block font-medium p-2">
                    Total:
                    <span ref={totalRef}>{Number(getTotal()).toFixed(2)}</span>
                  </label>
                </div>

                <Loadingbutton
                  isLoading={loading}
                  className="w-full  submit-hidden bg-blue-500 text-white px-4 py-2 rounded-md"
                  title="Submit"
                  loadingText={"Adding Invoices..."}
                  type="submit"
                />
                {/* <button
                  type="submit"
                  disabled={submitButtonDisabled}
                  className="w-full md:hidden bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Submit
                </button> */}
              </div>
              
              <div className="px-2">
              <div className="mb-4">
                  <Form.Check // prettier-ignore
                    type={"checkbox"}
                    label={`Create Client`}
                    checked={createClient}
                    onChange={handleCreateClientCheckbox}
                  />
                  </div>
                {!createClient &&
                  <div className="border rounded-lg p-2 mb-4 products-used">
                    <table className="w-full table-auto ">
                      <thead className="whitespace-normal">
                        <tr className="w-full d-flex gap-[10px]">
                          <th className="w-[50%]">Select Clients</th>
                          <th className="w-[50%]">Client Name</th>
                        </tr>
                      </thead>
                      <tbody className="whitespace-normal">
                        <tr key={1} className="w-full d-flex gap-[10px]">
                          <td className="w-[50%]">
                            <Form.Select onChange={handleClientChange} disabled={createClient}>
                              <option>Select Client</option>
                              {employeeList?.length >= 0 && employeeList.map((client) => (
                                <option value={client.name}>{client.name}</option>
                              ))}
                            </Form.Select>
                          </td>
                          <td className="w-[50%]">
                            <input disabled={createClient} className="w-full !py-1.5 px-1 border-gray-300 border rounded-md" value={clientName} readOnly />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                }
                
                {
                  createClient &&
                    <div className="border rounded-lg p-2 mb-4 products-used">
                      <Table className="w-full" striped bordered hover>
                        <thead>
                          <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr key={1}>
                            <td>
                              <Form.Control
                                type="text"
                                name="name"
                                placeholder="Enter First Name"
                                value={clientPayload.name}
                                onChange={(event)=>{setClientName(event.target.value)}}
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                name="last_name"
                                placeholder="Enter Last Name"
                                value={clientPayload.last_name}
                                onChange={(event)=>{setClientLastName(event.target.value)}}
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter Email Address"
                                value={clientPayload.email}
                                onChange={(event)=>{setClientEmail(event.target.value)}}
                                required
                              />
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                }
                <div className="border rounded-lg p-2 mb-4 products-used">
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
                        <td className="relative" ref={suggestProductListRef}>
                          <Select
                            className="w-full z-50"
                            options={productList}
                            value={null}
                            isDisabled={formData?.semaglitudeConsultation}
                            placeholder="Select Product Name"
                            onChange={handleProductListChange}
                          />
                          {/* <input
                            type="text"
                            name="productName"
                            id="product_name"
                            placeholder="Select Product Name"
                            autoComplete="off"
                            value={currentProduct?.name}
                            onClick={handleProductNameChange}
                            onChange={handleProductNameChange}
                            className="w-full p-1 border-gray-500 border rounded-md"
                          /> */}
                          {matchingProducts?.length >= 0 && (
                            <div className="absolute z-50 bg-white w-sm max-h-40 overflow-y-auto rounded-md mt-1 shadow-md">
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
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            name="productQuantity"
                            disabled={formData?.semaglitudeConsultation}
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
                                  message: ` You can only select quantity upto ${currentProduct?.maxQtantity || ""
                                    } for ${currentProduct?.name}`,
                                });
                            }}
                            min={0.01}
                            max={currentProduct?.maxQtantity?.toFixed(2)}
                            className="w-full !py-1.5 px-1
                          border-gray-300 border rounded-md"
                          />
                        </td>
                        <td>
                          <input
                            type="string"
                            name="productPrice"
                            autoComplete="off"
                            disabled={formData?.semaglitudeConsultation}
                            value={currentProduct.price}
                            className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                          />
                        </td>
                        <td className="text-right">
                          {Number(
                            currentProduct.quantity * currentProduct.price || 0
                          )?.toFixed(2)}
                        </td>
                        {/* <td>
                          <button
                            type="button"
                            onClick={handleAddProduct}
                            className={`${selectedProduct
                              ? "text-green-500 hover:animate-pulse "
                              : "text-gray-500 "
                              } px-2 `}
                            disabled={!selectedProduct}
                          >
                            <IoMdAddCircle className="w-6 h-6" />
                          </button>
                        </td> */}
                      </tr>
                      {formData.products?.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product?.name}
                            </p>
                          </td>
                          <td>
                            {/* <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {Number(product.quantity || 0).toFixed(2)}
                            </p> */}
                            <input
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              step="0.01"
                              name="productQuantity"
                              placeholder={`max:${findProductQuantity(authUserState.user.employees_inventories, product.id)}`}
                              value={product.quantity}
                              onChange={(e) => {
                                setIsAlert({
                                  productUsedShow: false,
                                  retailShow: false,
                                  message: "",
                                });
                                +e.target.value <= findProductQuantity(authUserState.user.employees_inventories, product.id)
                                  ? handleQuantityChange(e, product)
                                  : setIsAlert({
                                    productUsedShow: true,
                                    message: ` You can only select quantity upto ${findProductQuantity(authUserState.user.employees_inventories, product.id) || ""
                                      } for ${product?.name}`,
                                  });
                              }}
                              min={0.01}
                              max={(findProductQuantity(authUserState.user.employees_inventories, product.id)).toFixed(2)}
                              className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                            />
                          </td>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product.retail_price}
                            </p>
                          </td>
                          <td className="text-right">
                            {Number(
                              product.quantity * product.retail_price || 0
                            )?.toFixed(2)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeProduct(index, product)}
                              className="hover:text-red-500  text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
                            >
                              <RxCross2 className="w-6 h-6" />
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
                <div className="border rounded-lg p-2 mb-4 retail-products">
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
                        <td className="relative" ref={suggestRetailProductListRef}>
                          <Select
                            className="w-full z-40"
                            options={retailProductList}
                            value={null}
                            isDisabled={formData?.semaglitudeConsultation}
                            placeholder="Select Product Name"
                            onChange={handleRetailProductListChange}
                          />
                          {/* <input
                            type="text"
                            name="productName"
                            id="retail_product_name"
                            placeholder="Select Product Name"
                            autoComplete="off"
                            value={currentRetailProduct?.name}
                            onClick={handleRetailProductNameChange}
                            onChange={handleRetailProductNameChange}
                            className="w-full p-1 border-gray-500 border rounded-md"
                          // required
                          /> */}
                          {matchingRetailProducts?.length > 0 && (
                            <div className="absolute z-50 bg-white w-sm max-h-40 overflow-y-auto rounded-md mt-1 shadow-md">
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
                            onWheel={(e) => e.target.blur()}
                            name="productQuantity"
                            step="0.01"
                            disabled={formData?.semaglitudeConsultation}
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
                                  productUsedShow: false,
                                  retailShow: true,
                                  message: ` You can only select quantity upto ${currentRetailProduct?.maxQtantity || ""
                                    } for ${currentRetailProduct?.name}`,
                                });
                            }}
                            min="0"
                            max={currentRetailProduct?.maxQtantity?.toFixed(2)}
                            className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                          />
                        </td>
                        <td>
                          <input
                            type="string"
                            name="productPrice"
                            autoComplete="off"
                            disabled={formData?.semaglitudeConsultation}
                            value={currentRetailProduct.price}
                            className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                          />
                        </td>
                        <td className="text-right">
                          {Number(
                            currentRetailProduct.quantity *
                            currentRetailProduct.price || 0
                          )?.toFixed(2)}
                        </td>
                        {/* <td>
                          <button
                            type="button"
                            onClick={handleAddRetailProduct}
                            className={`${selectedRetailProduct
                              ? "text-green-500 hover:animate-pulse"
                              : "text-gray-500 "
                              } px-2`}
                            disabled={!selectedRetailProduct}
                          >
                            <IoMdAddCircle className="w-6 h-6" />
                          </button>
                        </td> */}
                      </tr>

                      {formData.retailProducts.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product?.name}
                            </p>
                          </td>
                          <td>
                            {/* <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product.quantity}
                            </p> */}
                            <input
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              step="0.01"
                              name="productQuantity"
                              placeholder={`max:${findProductQuantity(authUserState.user.employees_inventories, product.id)}`}
                              value={product.quantity}
                              onChange={(e) => {
                                setIsAlert({
                                  productUsedShow: false,
                                  retailShow: false,
                                  message: "",
                                });
                                +e.target.value <= findProductQuantity(authUserState.user.employees_inventories, product.id)
                                  ? handleRetailQuantityChange(e, product)
                                  : setIsAlert({
                                    productUsedShow: true,
                                    message: ` You can only select quantity upto ${findProductQuantity(authUserState.user.employees_inventories, product.id) || ""
                                      } for ${product?.name}`,
                                  });
                              }}
                              min={0.01}
                              max={(findProductQuantity(authUserState.user.employees_inventories, product.id)).toFixed(2)}
                              className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                            />
                          </td>
                          <td>
                            <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                              {product.cost_price}
                            </p>
                          </td>
                          <td className="text-right">{product.quantity * product.cost_price}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeRetailProduct(index, product)}
                              className="hover:text-red-500 text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
                            >
                              <RxCross2 className="w-6 h-6" />
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
                <div className="border rounded-lg p-2 mb-4">
                  <label className="block">
                    Total Product Price Sum:{" "}
                    {Number(getConsumableRetailPrice() || 0)?.toFixed(2)}
                  </label>
                </div>

                <Loadingbutton
                  isLoading={loading}
                  className="w-full sm-hidden md:block text-white px-4 py-2 !bg-cyan-400 !border-cyan-500 hover:!bg-cyan-500 focus:!bg-cyan-500"
                  title="Submit"
                  loadingText={"Adding Invoices..."}
                  type="submit"
                />
                {/* <button
                  type="submit"
                  className="w-full hidden md:block bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Submit
                </button> */}
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          {invoiceArray?.length > 0 &&
            invoiceArray?.map((invoice) => {
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
                  providerpurchased={invoice?.provider_purchased}
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
