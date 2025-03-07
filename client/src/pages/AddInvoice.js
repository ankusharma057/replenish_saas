/* eslint-disable eqeqeq */
import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, ListGroup, ListGroupItem, Spinner, Table } from "react-bootstrap";
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
import { RxCross2 } from "react-icons/rx";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import { SlCalender } from "react-icons/sl";
import {useNavigate} from "react-router-dom"
import dayjs from 'dayjs';

const initialFormState = {
  clientName: "",
  dateOfService: dayjs().format('MM-DD-YYYY'),
  conciergeFeePaid: false,
  gfe: false,
  semaglitudeConsultation: false,
  provider_purchased: false,
  paidByClientCash: 0,
  paidByClientCredit: 0,
  paidByClientProducts: 0,
  paidByClientRetailProducts: 0,
  paidByClientWellnessProducts: 0,
  personalDiscount: 0,
  tip: 0,
  comments: "",
  products: [],
  retailProducts: [],
  wellnessProducts: [],
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
  const [currentWellnessProduct, setCurrentWellnessProduct] = useState({
    name: "",
    price: 0,
    quantity: 1,
  });
  const suggestProductListRef = useRef(null);
  const suggestRetailProductListRef = useRef(null);
  const suggestWellnessProductListRef = useRef(null);
  const [selectedRetailProduct, setSelectedRetailProduct] = useState(null);
  const [matchingRetailProducts, setMatchingRetailProducts] = useState([]);
  const [selectedWellnessProduct, setSelectedWellnessProduct] = useState(null);
  const [matchingWellnessProducts, setMatchingWellnessProducts] = useState([]);
  const [clientName, setClientName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [allInvoiceProductsList, setAllInvoiceProductsList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productList, setProductList] = useState([]);
  const [retailProductList, setRetailProductList] = useState([]);
  const [wellnessProductList, setWellnessProductList] = useState([]);
  const [dateOfService, setDateOfService] = useState("")
  const [locationName, setLocationName] = useState("")
  const [locationId, setLocationId] = useState("")
  const [formData, setFormData] = useState({
    ...initialFormState,
    dateOfService: dayjs().format('MM-DD-YYYY'),
    location_id:"",
    instant_pay:false
  });
  const [invoiceArray, setInvoiceArray] = useState([]);
  const totalRef = useRef();
  const [isAlert, setIsAlert] = useState({
    retailShow: false,
    productUsedShow: false,
    wellnessShow: false,
    message: "",
    isClient: false,
    maxInvoice: false,
    location:false
  });
  const [showModal, setShowModal] = useState(false);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const servicePercentage = (parseInt(authUserState.user?.service_percentage) || 60) / 100;
  const retailPercentage = (parseInt(authUserState.user?.retail_percentage) || 10) / 100;
  const wellnessPercentage = (parseInt(authUserState.user?.wellness_percentage) || 20) / 100;
  const [isWellnessProductsVisible, setIsWellnessProductsVisible] = useState(false);

  const handleCheckboxChange = (event) => {
    setIsWellnessProductsVisible(event.target.checked);
  };

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
  const [showClientList,setShowClientList]=useState(false)
  const Navigate=useNavigate();
  const [screenLoading, setScreenLoading] = useState(false)
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

  const handleNavigation = (path) => {
    Navigate(path)
  }

  useEffect(() => {
    getEmployees()
    const newProducts = []
    const newRetailProductList = [];
    const newWellnessProducts = [];
    authUserState.user?.employees_inventories.forEach((inventory, index) => {
      if (
        inventory?.product &&
        inventory?.product?.product_type !== undefined
      ) {
        const productData = { 
          ...inventory?.product, 
          label: inventory?.product.name, 
          value: index 
        };
        if (!inventory?.product.product_type.includes("Retail") && !inventory?.product.product_type.includes("Wellness")) {
          newProducts.push(productData);
        } else if (inventory?.product.product_type.includes("Retail")) {
          newRetailProductList.push(productData);
        } else if (inventory?.product.product_type.includes("Wellness")) {
          newWellnessProducts.push(productData);
        }
      }
    });
  
    setProductList(newProducts);
    setRetailProductList(newRetailProductList);
    setWellnessProductList(newWellnessProducts);

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
  
      if (
        suggestWellnessProductListRef.current &&
        !suggestWellnessProductListRef.current.contains(event.target)
      ) {
        setMatchingWellnessProducts([]);
      }
    };
  
    document.addEventListener("click", handleClickOutside);
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
      if (selectedOption?.quantity > selectedOption?.maxQuantity) {
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
      if (selectedOption?.quantity > selectedOption?.maxQuantity) {
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

  const handleWellnessProductListChange = async (selectedOption) => {
    setSelectedWellnessProduct(selectedOption)
    if (selectedOption) {
      if (Number(selectedOption?.quantity) <= 0.009) {
        setIsAlert({
          wellnessShow: true,
          productUsedShow: false,
          message: `Minimum quantity is 0.01`,
        });
        return;
      }
      if (selectedOption?.quantity > selectedOption?.maxQuantity) {
        setIsAlert({
          wellnessShow: true,
          message: `Unable to add ${selectedOption?.name}, as the quantity is exhausted already`,
        });
        return;
      }

      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
      setCurrentWellnessProduct({ name: "", price: 0, quantity: 1 });
      let wellnessProductToBeAdded = {
        ...selectedOption,
        quantity: 1,
      };
      setSelectedWellnessProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        wellnessProducts: [...formData.wellnessProducts, wellnessProductToBeAdded],
      }));
      const newValues = wellnessProductList.filter(obj => obj.id !== selectedOption.id);

      setWellnessProductList([...newValues])

      setIsAlert({
        productUsedShow: false,
        wellnessShow: false,
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
      [name]: inputValue || 0,
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

  const removeWellnessProduct = (index, product) => {
    const updatedProducts = [...formData.wellnessProducts];
    updatedProducts.splice(index, 1);
    setFormData((prevFormData) => ({
      ...prevFormData,
      wellnessProducts: updatedProducts,
    }));
    setWellnessProductList((prevList) => [...prevList, product]);
  };

  const getTotalPaidByClient = () => {
    let totalPaid = formData.paidByClientProducts + formData.paidByClientRetailProducts + formData.paidByClientWellnessProducts;
    return totalPaid;
  };
  
  const totalAmountClientPaid = getTotalPaidByClient();

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
      if(product.purchased_type == 'provider_purchased'){
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

  const getWellnessCostPrice = () => {
    let sum = 0;
    formData.wellnessProducts.forEach((product) => {
      sum += getTotalCostPrice(product);
    });
    return sum;
  };

  const getWellnessRetailPrice = () => {
    let sum = 0;
    formData.wellnessProducts.forEach((product) => {
      sum += getTotalRetailPrice(product);
    });
    return sum;
  };

  const calculateTax = (amountPaid) => {
    let afterTaxprice = amountPaid - amountPaid * percentage;

    return afterTaxprice;
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
    const totalProductPriceSum = getConsumableCostPrice();
    const paidByClientProducts = calculateTax(formData.paidByClientProducts);
  
    let total = 0;
    let providerPurchasedCostPrice = getProviderPurchasedCostPrice();
    let productsTotal = ((paidByClientProducts - totalProductPriceSum) * servicePercentage) + providerPurchasedCostPrice;
    let retailProductsTotal = calculateTax(formData.paidByClientRetailProducts) * retailPercentage; 
    let wellnessTotal = calculateTax(formData.paidByClientWellnessProducts) * wellnessPercentage;
    total = productsTotal + retailProductsTotal + wellnessTotal - ((formData.personalDiscount * 0.5) || 0);

    if(formData.instant_pay) {
      total = total - total/100
    }
    return total.toFixed(2);
  };

  const getExpectedReplenishIncome = () => {
    let totalRetail = getConsumableRetailPrice() + getRetailRetailPrice() + getWellnessRetailPrice();
    let totalCost = getConsumableCostPrice() + getRetailCostPrice() + getWellnessCostPrice();
    let expectedIncome = totalRetail - totalCost;
    expectedIncome = expectedIncome - (expectedIncome * percentage);
    expectedIncome = expectedIncome * (1 - servicePercentage);
    return expectedIncome;
  };

  const getActualReplenishIncome = () => {
    let injectorPay = getTotal();
    let actualIncome =
      (injectorPay / (servicePercentage)) *
      (1  - servicePercentage);
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
        maxQuantity:
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
      if (currentProduct?.quantity > currentProduct?.maxQuantity) {
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
        maxQuantity:
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

  const handleWellnessProductSelection = (selectedWellnessProductName) => {
    const selectedProduct = authUserState.user?.employees_inventories?.find(
      (product) => product?.product?.name === selectedWellnessProductName
    );

    if (selectedProduct.product) {
      setCurrentWellnessProduct({
        name: selectedProduct?.product.name,
        price: selectedProduct?.product.cost_price,
        quantity: 1,
        maxQuantity:
          selectedProduct.quantity -
          Number(
            (allInvoiceProductsList &&
              allInvoiceProductsList?.wellnessProductQuantities[
                selectedProduct?.product?.id
              ]?.sumofQuantity) ||
            0
          ),
        id: selectedProduct.product?.id,
      });
      setSelectedWellnessProduct(selectedProduct?.product);
      setMatchingWellnessProducts([]);
    } else {
      setCurrentWellnessProduct({
        name: selectedWellnessProductName,
        price: 0,
        quantity: 1,
      });
      setSelectedWellnessProduct(null);
      setMatchingWellnessProducts([]);
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

  const handleWellnessQuantityChange = (e, product) => {
    function changeObjectPropertyValue(objectId, propertyName, newValue) {
      let objectIndex = formData.wellnessProducts.findIndex(obj => obj.id === objectId);
      
      if (objectIndex !== -1) {
        formData.wellnessProducts[objectIndex][propertyName] = newValue;
      }
    }
    changeObjectPropertyValue(product.id, 'quantity', e.target.value);
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
      if (currentRetailProduct?.quantity > currentRetailProduct?.maxQuantity) {
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
    setCurrentWellnessProduct({ name: "", price: 0, quantity: 1 });
  };

  function calculateProductQuantities(data) {
    const productQuantities = {};
    const retailProductQuantities = {};
    const wellnessProductQuantities = {};

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
      calculateQuantities(obj.wellness_products, wellnessProductQuantities);
    }

    return { productQuantities, retailProductQuantities, wellnessProductQuantities };
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
    else if (!formData.dateOfService) {
      setIsAlert({
        isClient: true,
        message: "Please Add Date of service",
      });
      return;
    } 
    // else if (formData?.location_id==="") {
    //   setIsAlert({
    //     location: true,
    //     message: "Please select location",
    //   });
    //   return;
    // }

    else if (formData?.products?.length == 0) {
      setIsAlert({
        productUsedShow: true,
        message: "Please select product",
      });
      return;
    }

    let total = Number(getTotal()).toFixed(2)
    let invoice = {
      employee_id: authUserState.user.id,
      user_name: authUserState.user?.name,
      clientname: clientName,
      lastname:clientLastName,
      email:clientEmail,
      beforeImages: blobsForBefore,
      afterImages: blobsForAfter,
      payment_type: selectedOption,
      date_of_service: formData?.dateOfService,
      semag_consult_fee: formData?.semaglitudeConsultation,
      provider_purchased: formData?.provider_purchased,
      amt_paid_for_products: formData?.paidByClientProducts,
      amt_paid_for_retail_products: formData?.paidByClientRetailProducts,
      amt_paid_for_wellness_products: formData?.paidByClientWellnessProducts,
      personal_discount: formData?.personalDiscount,
      comments: formData?.comments,
      products: formData.products,
      retail_products: formData.retailProducts,
      wellness_products: formData.wellnessProducts,
      charge: total,
      expected_income: getExpectedReplenishIncome(),
      actual_income: getActualReplenishIncome(),
      income_flag: replenishIncomeFlag(),
      total_after_deduction: formData.totalAfterDeduction,
      get_total_price_by_client: calculateTax(getTotalPaidByClient()),
      total_consumable_cost: getConsumableRetailPrice() + getRetailRetailPrice() + getWellnessRetailPrice(),
      location_id:locationId,
      instant_pay: formData?.instant_pay
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
      setClient("");
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
    if(invoiceData && ((Array.isArray(invoiceData[0].products) && invoiceData[0].products.length>0))){
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
                setSelectedClient(selectedClient);
                setClientLastName("")
                setClientEmail("")
                setLocationId("");
                setClient("");
                setLocationName("");
                setClient("");
                setCreateClient(false);
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
    }else{
      toast.error("Please select product or client to generate invoice")
    }
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
      setSelectedClient("");
      setClientName("")
      setClientLastName("")
      setClientEmail("")
  };

  const handleCreateClientCheckbox = (event) => {
    setCreateClient(event.target.checked)
  };

  const handleSelectClient=(clientName)=>{
    setShowClientList(true)
    setClient(clientName)
    let selectedClient = employeeList.find((client) => client.name === clientName);
    if(selectedClient){      
    setSelectedClient(selectedClient);
    setClientName(selectedClient?.name)
    setClientLastName(selectedClient?.last_name)
    setClientEmail(selectedClient?.email)
      setIsAlert((prev) => ({
        ...prev,
        isClient: false,
        message: ""
      }))
  }
  }
  const handleInvoiceLocationSelect = (event) => {
    let employeeLocation = authUserState.user.employee_locations.find((item) => { return item.location.name === event.target.value })
    if (employeeLocation) {
      const locationId = employeeLocation.location.id;
      setLocationName(employeeLocation.location.name)
      setLocationId(locationId)
      setFormData((prevFormData) => ({
        ...prevFormData,
        location_id: locationId
      }));
      setIsAlert({
        location: false,
        message: "",
      });
    }
  };

  const ScreenLoading = () => {
    return <div style={{ width: "100%", height: "100%", position: "absolute", zIndex: 99999, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(2px)" }} className='d-flex justify-content-center align-items-center'>
      <Spinner animation="border" variant="info" />
    </div>
  }

  const [selectedOption, setSelectedOption] = useState("credit_card");
  const [percentage, setPercentage] = useState(0.06);
  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedOption(value);
    
    switch (value) {
      case "credit_card":
        setPercentage(0.06);
        break;
      case "cherry":
        setPercentage(0.15);
        break;
      case "other":
        setPercentage(0.03);
        break;
      default:
        setPercentage(0);
    }
  };

  return (
    <>
      <div className="bg-blue-200 p-1 sm:p-4 position-relative" style={{position:"relative"}}>
      {screenLoading && <ScreenLoading />}
        <div className="bg-blue-200 min-h-screen pb-8 flex items-center justify-center flex-col md:p-4">
          {isAlert.maxInvoice && (
            <Alert variant="warning">{isAlert.message}</Alert>
          )}
          <form className=" bg-white md:p-4 rounded-md" onSubmit={handleSubmit}>
            <div className="flex justify-end  mr-4 my-2 ">
              <Button
                onClick={()=>Navigate("/add-new-client")}
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
                <label className="mb-2 block d-flex flex-column">
                  Location
                  <div className="w-full d-flex align-items-center">
                    <Form.Select 
                      value={locationName}
                      onChange={(e) => {
                        if (e.target.value === "create_location") {
                          handleNavigation(`/settings/locations/new`);
                        } else {
                          handleInvoiceLocationSelect(e);
                        }
                      }}
                      required 
                      className="h-[34px]"
                    >
                      <option>Select location</option>
                      <option value="create_location">+ Create New Location</option>
                      {authUserState.user.employee_locations?.length >= 0 && authUserState.user.employee_locations.map((item) => (
                        <option key={item.location.id} value={item.location.name}>{item.location.name}</option>
                      ))}
                    </Form.Select>
                  </div>
                  {isAlert.location && <span className="text-danger">Please select location</span>}
                </label>
                <label className="mb-2 block d-flex flex-column">
                  Date of Service:
                  <div className="w-full d-flex p-1 border align-items-center rounded border-gray-300">
                  <DatePicker
                    format="MM/DD/YYYY"
                    value={formData.dateOfService}
                    onChange={(value) => {
                      const formattedDate = dayjs(value).format('MM-DD-YYYY');
                      setFormData((prevState) => ({
                        ...prevState,
                        dateOfService: formattedDate,
                      }));
                    }}
                    multiple={false}
                    style={{
                      width:"100%",
                      padding:"10px",
                      border:"none",
                      outline:"none"
                    }}
                    placeholder="mm/dd/yyyy"
                  />
                  <SlCalender />
                  </div>
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
                <div className="border rounded-lg p-2 mb-4 w-100">
                  <label className="flex justify-between font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                    Pay Faster:
                    <input
                      type="checkbox"
                      name="instant_pay"
                      checked={formData?.instant_pay}
                      onChange={(event) => handleInputChange(event)}
                      className="ml-2"
                    />
                  </label>
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
                <div className="border rounded-lg p-4 mb-4 w-full bg-transparent shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-2">Total</h3>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-600">Total Owed to Provider:</span>
                    <span className="font-semibold text-red-500" ref={totalRef}>{Number(getTotal()).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-600">Total Amount Client Paid:</span>
                    <span className="font-semibold text-green-600">{Number(totalAmountClientPaid).toFixed(2)}</span>
                  </div>
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
                  <div className="pb-4 bg-white rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Select Payment Method</h2>
                    <div className="flex w-full justify-between space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="credit_card"
                          checked={selectedOption === "credit_card"}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 border-cyan-500 flex items-center justify-center ${
                            selectedOption === "credit_card" ? "bg-cyan-500" : ""
                          }`}
                        >
                          {selectedOption === "credit_card" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <span>Credit/Debit</span>
                      </label>
  
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="cherry"
                          checked={selectedOption === "cherry"}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 border-cyan-500 flex items-center justify-center ${
                            selectedOption === "cherry" ? "bg-cyan-500" : ""
                          }`}
                        >
                          {selectedOption === "cherry" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <span>Cherry Payments/Affirm</span>
                      </label>
  
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="other"
                          checked={selectedOption === "other"}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 border-cyan-500 flex items-center justify-center ${
                            selectedOption === "other" ? "bg-cyan-500" : ""
                          }`}
                        >
                          {selectedOption === "other" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <span>Other</span>
                      </label>
                    </div>
                  </div>
                 {/* {!createClient &&
                  <div className="border rounded-lg p-2 mb-4 products-used">
                    <table className="w-full table-auto ">
                      <thead className="whitespace-normal">
                        <tr className="w-full d-flex gap-[10px]">
                          <th className="w-[50%]">Client Name</th>
                        </tr>
                      </thead>
                      <tbody className="whitespace-normal">
                        <tr key={1} className="w-full d-flex gap-[10px]">
                          <td className="w-[50%]" style={{position:"relative"}}>
                            <Form.Select value={client} onChange={handleClientChange} disabled={createClient}>
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

                } */}
                {!createClient && (
                  <div className="border rounded-lg p-2 mb-4 products-used position-relative">
                    <input
                      className="w-full py-1.5 px-1 border-gray-300 border rounded-md"
                      value={client}
                      onChange={handleClientChange}
                      onFocus={() => setShowClientList(true)}
                      placeholder="Type to search client"
                      onBlur={() => {
                        setTimeout(() => setShowClientList(false), 150);
                      }}
                    />

                    {showClientList && client?.length>0 ?(
                      <ListGroup
                        style={{
                          position: 'absolute',
                          zIndex: 999,
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#fff',
                          width: '100%',
                          maxHeight: '300px',
                          overflowY: 'scroll',
                        }}
                      >
                        {employeeList
                          .filter((item) =>
                            item?.name?.toLowerCase().includes(client?.toLowerCase())
                          )
                          .map((client, index) => (
                            <ListGroup.Item
                              key={index}
                              value={client?.name}
                              onMouseDown={() => handleSelectClient(client?.name)}
                              style={{ cursor: 'pointer' }}
                            >
                              {client?.name}
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    ):""}
                    {isAlert.isClient && <span className="text-danger">{isAlert.message}</span>}
                  </div>
                )}

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
                                value={clientName}
                                onChange={(event)=>{setClientName(event.target.value)}}
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                name="last_name"
                                placeholder="Enter Last Name"
                                value={clientLastName}
                                onChange={(event)=>{setClientLastName(event.target.value)}}
                                required
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter Email Address"
                                value={clientEmail}
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
                        <th className="text-center">MSRP</th>
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
                            placeholder={`max:${currentProduct?.maxQuantity}`}
                            value={currentProduct.quantity}
                            onChange={(e) => {
                              setIsAlert({
                                productUsedShow: false,
                                retailShow: false,
                                message: "",
                              });
                              +e.target.value <= currentProduct?.maxQuantity
                                ? handleQuantityChange(e)
                                : setIsAlert({
                                  productUsedShow: true,
                                  message: ` You can only select quantity upto ${currentProduct?.maxQuantity || ""
                                    } for ${currentProduct?.name}`,
                                });
                            }}
                            min={0.01}
                            max={currentProduct?.maxQuantity?.toFixed(2)}
                            className="w-full !py-1.5 px-1
                          border-gray-300 border rounded-md"
                          />
                        </td>
                        <td className="text-center">
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
                                  wellnessShow: false,
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
                          <td className="text-center">
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
                  <hr />
                  <div className="ml-[60%]">
                    <h2 className="text-lg font-semibold mb-0 text-cyan-500">Amount Client Paid</h2>
                    <input
                      type="number"
                      name="paidByClientProducts"
                      className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                      min="0"
                      value={Number(formData.paidByClientProducts).toString()}
                      onChange={(event) => handleInputChange(event)}
                    />
                  </div>
                  {isAlert.productUsedShow && (
                    <span className="text-danger">{isAlert?.message}</span>
                  )}
                </div>
                <hr />
                <div className="border rounded-lg p-2 mb-4 retail-products">
                  <table className="w-full table-autol">
                    <thead>
                      <tr>
                        <th>Retail Products</th>
                        <th>Product Quantity</th>
                        <th className="text-center">MSRP</th>
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
                            placeholder="Select Product Name"
                            onChange={handleRetailProductListChange}
                          />
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
                            placeholder={`max:${currentRetailProduct?.maxQuantity}`}
                            value={currentRetailProduct.quantity}
                            onChange={(e) => {
                              setIsAlert({
                                productUsedShow: false,
                                retailShow: false,
                                wellnessShow: false,
                                message: "",
                              });
                              +e.target.value <=
                                currentRetailProduct?.maxQuantity
                                ? handleRetailQuantityChange(e)
                                : setIsAlert({
                                  productUsedShow: false,
                                  retailShow: true,
                                  wellnessShow : false,
                                  message: ` You can only select quantity upto ${currentRetailProduct?.maxQuantity || ""
                                    } for ${currentRetailProduct?.name}`,
                                });
                            }}
                            min="0"
                            max={currentRetailProduct?.maxQuantity?.toFixed(2)}
                            className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                          />
                        </td>
                        <td className="text-center">
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
                                  wellnessShow: false,
                                  message: "",
                                });
                                +e.target.value <= findProductQuantity(authUserState.user.employees_inventories, product.id)
                                  ? handleRetailQuantityChange(e, product)
                                  : setIsAlert({
                                    retailShow: true,
                                    message: ` You can only select quantity upto ${findProductQuantity(authUserState.user.employees_inventories, product.id) || ""
                                      } for ${product?.name}`,
                                  });
                              }}
                              min={0.01}
                              max={(findProductQuantity(authUserState.user.employees_inventories, product.id)).toFixed(2)}
                              className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                            />
                          </td>
                          <td className="text-center">{product.quantity * product.cost_price}</td>
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
                  <hr />
                  <div className="ml-[60%]">
                    <h2 className="text-lg font-semibold mb-0 text-cyan-500">Amount Client Paid</h2>
                    <input
                      type="number"
                      name="paidByClientRetailProducts"
                      className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                      min="0"
                      value={Number(formData.paidByClientRetailProducts).toString()}
                      onChange={(event) => handleInputChange(event)}
                    />
                  </div>
                  {isAlert.retailShow && (
                    <span className="text-danger">{isAlert?.message}</span>
                  )}
                </div>
                <hr />
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={isWellnessProductsVisible}
                    onChange={handleCheckboxChange} 
                    className="form-checkbox" 
                  />
                  <span>Wellness</span>
                </label>
                <hr />

                {isWellnessProductsVisible && (
                  <div className="border rounded-lg p-2 mb-4 wellness-products">
                    <table className="w-full table-auto">
                      <thead>
                        <tr>
                          <th>Wellness Products</th>
                          <th>Quantity</th>
                          <th className="text-center">MSRP</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="relative" ref={suggestWellnessProductListRef}>
                            <Select
                              className="w-full z-40"
                              options={wellnessProductList}
                              value={null}
                              placeholder="Select Product Name"
                              onChange={handleWellnessProductListChange}
                            />
                            {matchingWellnessProducts?.length > 0 && (
                              <div className="absolute z-50 bg-white w-sm max-h-40 overflow-y-auto rounded-md mt-1 shadow-md">
                                {matchingWellnessProducts
                                  ?.filter(
                                    (item1) =>
                                      !formData?.wellnessProducts.some(
                                        (item2) => item2?.name === item1?.name
                                      )
                                  )
                                  ?.map((product) => (
                                    <p
                                      key={product.id}
                                      className="p-2 cursor-pointer hover:bg-gray-100"
                                      onClick={() =>
                                        handleWellnessProductSelection(product?.name)
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
                              name="productQuantity"
                              step="0.01"
                              placeholder={`max:${currentWellnessProduct?.maxQuantity}`}
                              value={currentWellnessProduct.quantity}
                              onChange={(e) => {
                                setIsAlert({
                                  productUsedShow: false,
                                  retailShow: false,
                                  wellnessAlertShow: false,
                                  message: "",
                                });
                                +e.target.value <= currentWellnessProduct?.maxQuantity
                                  ? handleWellnessQuantityChange(e)
                                  : setIsAlert({
                                      wellnessAlertShow: true,
                                      message: `You can only select quantity up to ${currentWellnessProduct?.maxQuantity || ""} for ${currentWellnessProduct?.name}`,
                                    });
                              }}
                              min="0"
                              max={currentWellnessProduct?.maxQuantity?.toFixed(2)}
                              className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                            />
                          </td>
                          <td className="text-center">
                            {Number(
                              currentWellnessProduct.quantity * currentWellnessProduct.price || 0
                            ).toFixed(2)}
                          </td>
                        </tr>

                        {formData.wellnessProducts.map((product, index) => (
                          <tr key={index}>
                            <td>
                              <p className="w-full p-1 border-gray-500 border rounded-md my-1">
                                {product?.name}
                              </p>
                            </td>
                            <td>
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
                                    wellnessAlertShow: false,
                                    retailShow: false,
                                    message: "",
                                  });
                                  +e.target.value <=
                                  findProductQuantity(authUserState.user.employees_inventories, product.id)
                                    ? handleWellnessQuantityChange(e, product)
                                    : setIsAlert({
                                        wellnessAlertShow: true,
                                        message: `You can only select quantity up to ${findProductQuantity(authUserState.user.employees_inventories, product.id) || ""} for ${product?.name}`,
                                      });
                                }}
                                min={0.01}
                                max={(findProductQuantity(authUserState.user.employees_inventories, product.id)).toFixed(2)}
                                className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                              />
                            </td>
                            <td className="text-center">
                              {product.quantity * product.cost_price}
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => removeWellnessProduct(index, product)}
                                className="hover:text-red-500 text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
                              >
                                <RxCross2 className="w-6 h-6" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <hr />
                    <div className="ml-[60%]">
                      <h2 className="text-lg font-semibold mb-0 text-cyan-500">Amount Client Paid</h2>
                      <input
                        type="number"
                        name="paidByClientWellnessProducts"
                        className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                        min="0"
                        value={Number(formData.paidByClientWellnessProducts).toString()}
                        onChange={(event) => handleInputChange(event)}
                      />
                    </div>
                    {isAlert.wellnessAlertShow && (
                      <span className="text-danger">{isAlert?.message}</span>
                    )}
                  </div>
                )}

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
                <>
                <AddInvoiceTemplate
                  key={invoice.id}
                  id={invoice.id}
                  user={invoice.user_name}
                  employee_id={invoice.employee_id}
                  clientname={invoice.clintname}
                  dateOfService={invoice?.date_of_service}
                  payment_type={invoice?.payment_type}
                  conciergeFeePaid={invoice?.concierge_fee_paid}
                  gfe={invoice?.gfe}
                  semaglitudeConsultation={invoice?.semag_consult_fee}
                  providerpurchased={invoice?.provider_purchased}
                  paidByClientCash={invoice?.paid_by_client_cash}
                  paidByClientCredit={invoice?.paid_by_client_credit}
                  paidByClientProducts={invoice?.amt_paid_for_products}
                  paidByClientRetailProducts={invoice?.amt_paid_for_retail_products}
                  paidByClientWellnessProducts={invoice?.amt_paid_for_wellness_products}
                  personalDiscount={invoice?.personal_discount}
                  tip={invoice?.tip}
                  comments={invoice?.comments}
                  products={invoice.products}
                  retailProducts={invoice.retail_products}
                  wellnessProducts={invoice.wellness_products}
                  charge={invoice.charge}
                  getTotalPriceByClient={invoice.get_total_price_by_client}
                  totalConsumableCost={invoice.total_consumable_cost}
                  actual_income={invoice.actual_income}
                  income_flag={invoice.income_flag}
                  expected_income={invoice.expected_income}
                  handleDeleteInvoice={handleDeleteInvoice}
                />
                </>
              );
            })}
        </div>
      </div>
    </>
  );
}
