import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, ListGroup, Table } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { LOGIN } from "../Constants/AuthConstants";
import {
  createGroupInvoices,
  fetchMentors,
  getClients,
  getInvoiceList,
  getUpdatedUserProfile,
} from "../Server";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { useAuthContext } from "../context/AuthUserContext";
import { RxCross2 } from "react-icons/rx";
import Select from "react-select";
import DatePicker from "react-multi-date-picker";
import { SlCalender } from "react-icons/sl";
import dayjs from 'dayjs';

const initialFormState = {
  clientName: "",
  dateOfService: dayjs().format('MM-DD-YYYY'),
  provider_purchased: false,
  payment_type: "",
  paidByClientMPProducts: 0,
  comments: "",
  mpProducts: [],
  serviceExperience: null,
  comfortWithModality: null,
  mentorValueProvided: null,
  serviceExperienceReason: "",
  comfortWithModalityReason: "",
  mentorValueProvidedReason: ""
};

const MPInvoice = () => {
  const { authUserState, authUserDispatch } = useAuthContext();
  const suggestMPProductListRef = useRef(null);
  const [selectedMPProduct, setSelectedMPProduct] = useState(null);
  const [matchingMPProducts, setMatchingMPProducts] = useState([]);
  const [mpProductList, setMPProductList] = useState([]);
  const [currentMPProduct, setCurrentMPProduct] = useState({
    name: "",
    price: 0,
    quantity: 1,
  });
  const [clientName, setClientName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [allInvoiceProductsList, setAllInvoiceProductsList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...initialFormState,
    dateOfService: dayjs().format('MM-DD-YYYY'),
    instantPay: false
  });
  const [invoiceArray, setInvoiceArray] = useState([]);
  const [isAlert, setIsAlert] = useState({
    retailShow: false,
    productUsedShow: false,
    message: "",
    isClient: false,
    maxInvoice: false,
  });

  const [blobsForBefore, setBlobForBefore] = useState([]);
  const [blobsForAfter, setBlobForAfter] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [client, setClient] = useState();
  const [createClient, setCreateClient] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const [mentorList, setMentorList] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  useEffect(() => {
    const getMentors = async () => {
      try {
        const mentors = await fetchMentors();
        setMentorList(mentors);
      } catch (error) {
        toast.error('Unable to Fetch Mentors');
      }
    };

    getMentors();
  }, []);

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
    const newMPProductList = [];
    authUserState.user?.employees_inventories.forEach((inventory, index) => {
      if (
        inventory?.product !== undefined &&
        inventory?.product !== null &&
        inventory?.product !== "" &&
        inventory?.product?.product_type !== undefined
      ) {
        if (inventory?.product.purchased_type == "mentorship_purchased") {
          newMPProductList.push({ ...inventory?.product, label: inventory?.product.name, value: index });
        }
      }
    });
    setMPProductList(newMPProductList)
    const handleClickOutside = (event) => {
      if (
        suggestMPProductListRef.current &&
        !suggestMPProductListRef.current.contains(event.target)
      ) {
        setMatchingMPProducts([]);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);


  const handleReasonChange = (event, field) => {
    const { value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleMPProductListChange = async (selectedOption) => {
    setSelectedMPProduct(selectedOption);
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
      setCurrentMPProduct({ name: "", price: 0, quantity: 1 });
      let productToBeAdded = {
        ...selectedOption,
        quantity: 1,
      };
      setSelectedMPProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        mpProducts: [...formData.mpProducts, productToBeAdded],
      }));
      const newValues = mpProductList.filter(obj => obj.id !== selectedOption.id);
      setMPProductList([...newValues])
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
  
    const inputValue = 
      type === "checkbox" 
        ? checked 
        : type === "radio" || value === "yes" || value === "no" 
          ? value === "yes" 
          : isNaN(value) 
            ? value 
            : +value;
  
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
  

  const removeMPProduct = (index, product) => {
    const updatedProducts = [...formData.mpProducts];
    updatedProducts.splice(index, 1);
    setFormData((prevFormData) => ({
      ...prevFormData,
      mpProducts: updatedProducts,
    }));
    setMPProductList([...mpProductList, product]);
  };
  const handleMPProductSelection = (selectedProductName) => {
    const selectedMPProduct = authUserState.user?.employees_inventories?.find(
      (product) => product?.product?.name === selectedProductName
    );

    if (selectedMPProduct.product) {
      setCurrentMPProduct({
        name: selectedMPProduct?.product.name,
        price: selectedMPProduct?.product.cost_price,
        quantity: 1,
        maxQuantity:
          selectedMPProduct.quantity -
          Number(
            (allInvoiceProductsList &&
              allInvoiceProductsList?.productQuantities[
                selectedMPProduct?.product?.id
              ]?.sumofQuantity) ||
            0
          ),
        id: selectedMPProduct.product?.id,
      });
      setSelectedMPProduct(selectedMPProduct?.product);
      handleAddMPProduct();
      setMatchingMPProducts([]);
    } else {
      setCurrentMPProduct({ name: selectedProductName, price: 0, quantity: 1 });
      setSelectedMPProduct(null);
      setMatchingMPProducts([]);
    }
  };

  const handleMPQuantityChange = (e, product) => {
    function changeObjectPropertyValue(objectId, propertyName, newValue) {
      let objectIndex = formData.mpProducts.findIndex(obj => obj.id === objectId);
      if (objectIndex !== -1) {
        formData.mpProducts[objectIndex][propertyName] = newValue;
      }
    }
    changeObjectPropertyValue(product.id, 'quantity', e.target.value);
  };

  const handleAddMPProduct = () => {
    if (selectedMPProduct) {
      if (Number(currentMPProduct?.quantity) <= 0.009) {
        setIsAlert({
          retailShow: true,
          productUsedShow: false,
          message: `Minimum quantity is 0.01`,
        });
        return;
      }
      if (currentMPProduct?.quantity > currentMPProduct?.maxQuantity) {
        setIsAlert({
          retailShow: true,
          message: `Unable to add ${currentMPProduct?.name}, as the quantity is exhausted already`,
        });
        return;
      }

      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
      setCurrentMPProduct({ name: "", price: 0, quantity: 1 });
      let mpProductToBeAdded = {
        ...selectedMPProduct,
        quantity: currentMPProduct.quantity,
      };
      setSelectedMPProduct(null);
      setFormData((prevFormData) => ({
        ...prevFormData,
        retailProducts: [...formData.mpProducts, mpProductToBeAdded],
      }));

      setIsAlert({
        productUsedShow: false,
        retailShow: false,
        message: "",
      });
    }
  };

  function calculateProductQuantities(data) {
    const mpProductQuantities = {};

    function calculateQuantities(arr, quantityMap) {
      for (const product of arr) {
        const { id, name, quantity } = product;
        if (quantityMap[id]) {
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
      calculateQuantities(obj.mp_products, mpProductQuantities);
    }

    return { mpProductQuantities };
  }

  const getTotalRetailPrice = (product) => {
    return +product.retail_price * +product.quantity;
  };

  const totalConsumableCost = () => {
    let sum = 0;
    formData.mpProducts.forEach((product) => {
      sum += getTotalRetailPrice(product);
    });
    return sum;
  }


  const addMoreInvoice = (submit) => {
    if (!clientName) {
      setIsAlert({
        isClient: true,
        message: "Please Add Client Name",
      });
      return;
    }
    if (!formData.dateOfService) {
      setIsAlert({
        isClient: true,
        message: "Please Add Date of service",
      });
      return;
    }
    let invoice = {
      employee_id: authUserState.user.id,
      user_name: authUserState.user?.name,
      clientname: clientName,
      lastname: clientLastName,
      email: clientEmail,
      beforeImages: blobsForBefore,
      afterImages: blobsForAfter,
      date_of_service: formData?.dateOfService,
      amt_paid_for_mp_products: formData?.paidByClientMPProducts,
      personal_discount: formData?.personalDiscount,
      tip: formData?.tip,
      comments: formData?.comments,
      products: [],
      retail_products: [],
      mp_products: formData.mpProducts,
      wellness_products: [],
      instant_pay: formData.instantPay,
      payment_type: selectedOption,
      get_total_price_by_client: calculateTax(formData.paidByClientMPProducts),
      service_experience: formData.serviceExperience,
      comfort_with_modality: formData.comfortWithModality,
      mentor_value_provided: formData.mentorValueProvided,
      mentor_id: selectedMentor?.value,
      service_experience_reason: formData.serviceExperienceReason,
      comfort_with_modality_reason: formData.comfortWithModalityReason,
      mentor_value_provided_reason: formData.mentorValueProvidedReason,
      total_consumable_cost: totalConsumableCost()
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
      setClientName("");
      setClient("");
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

    data.forEach(item => {
      if (item.product.id === productId) {
        quantity += item.quantity;
      }
    });

    return quantity;
  }

  const handleClientChange = (event) => {
    setClient(event.target.value);
    let selectedClient = employeeList.find((client) => client.name === event.target.value);
    setSelectedClient(selectedClient);
    setClientName(selectedClient?.name)
    setClientLastName(selectedClient?.last_name)
    setClientEmail(selectedClient?.email)
  };

  const handleCreateClientCheckbox = (event) => {
    setCreateClient(event.target.checked)
  };

  const handleSelectClient = (clientName) => {
    setShowClientList(true)
    setClient(clientName)
    let selectedClient = employeeList.find((client) => client.name === clientName);
    if (selectedClient) {
      setSelectedClient(selectedClient);
      setClientName(selectedClient?.name)
      setClientLastName(selectedClient?.last_name)
      setClientEmail(selectedClient?.email)
    }
  }

  const calculateTax = (amountPaid) => {
    let afterTaxprice = amountPaid - amountPaid * percentage;
    
    return afterTaxprice;
  };

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
    <div>
      <div className="flex items-center justify-center flex-col">
        {isAlert.maxInvoice && (
          <Alert variant="warning">{isAlert.message}</Alert>
        )}
        <form className=" bg-white md:p-4 rounded-md" onSubmit={handleSubmit}>
          <div className="border rounded-lg gap-4 p-2 py-4 items-center mb-4 mt-4 flex flex-col flex-wrap justify-center md:flex-row md:justify-around">
            <div className="text-center">
              <h4>Provider:</h4>
              <div>{authUserState.user?.name}</div>
            </div>
            <div className="flex flex-col w-full gap-4 mt-2 md:w-auto md:mt-0 md:flex-row">
              <label className="mb-2 block d-flex flex-column">
                Date of Service:
                <div className="w-full d-flex p-1 border align-items-center rounded border-gray-300">
                  <DatePicker
                    format="MM/DD/YYYY"
                    value={formData.dateOfService}
                    onChange={(value) => setFormData((prevstate) => ({ ...prevstate, dateOfService: value?.toDate().getTime() }))}
                    multiple={false}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "none",
                      outline: "none"
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
                  <span className="font-medium text-gray-600">Total Amount Client Paid:</span>
                  <span className="font-semibold text-green-600">{formData?.paidByClientMPProducts}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-600">Total Amount: </span>
                  <span className="font-semibold text-red-500">{calculateTax(formData?.paidByClientMPProducts)}</span>
                </div>
              </div>

              <Loadingbutton
                isLoading={loading}
                className="w-full  submit-hidden bg-blue-500 text-white px-4 py-2 rounded-md"
                title="Submit"
                loadingText={"Adding Invoices..."}
                type="submit"
              />
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
                    required
                  />

                  {showClientList && client?.length > 0 ? (
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
                  ) : ""}
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
                            onChange={(event) => { setClientName(event.target.value) }}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            name="last_name"
                            placeholder="Enter Last Name"
                            value={clientLastName}
                            onChange={(event) => { setClientLastName(event.target.value) }}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter Email Address"
                            value={clientEmail}
                            onChange={(event) => { setClientEmail(event.target.value) }}
                            required
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              }

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

              <div className="border rounded-lg p-2 mb-4">
                <label className="block font-medium p-2">Who the Mentor was:</label>
                <Select
                  className="w-full z-10"
                  options={mentorList}
                  value={selectedMentor}
                  onChange={(option) => setSelectedMentor(option)}
                  placeholder="Select Mentor"
                  required
                />
              </div>

              <div className="border rounded-lg p-2 mb-4 products-used">
                <table className="w-full table-auto ">
                  <thead className="whitespace-normal">
                    <tr>
                      <th>MP Products</th>
                      <th>Product Quantity</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="whitespace-normal">
                    <tr key={1}>
                      <td className="relative" ref={suggestMPProductListRef}>
                        <Select
                          className="w-full z-5"
                          options={mpProductList}
                          value={null}
                          isDisabled={formData?.semaglitudeConsultation}
                          placeholder="Select Product Name"
                          onChange={handleMPProductListChange}
                        />
                        {matchingMPProducts?.length >= 0 && (
                          <div className="absolute z-50 bg-white w-sm max-h-40 overflow-y-auto rounded-md mt-1 shadow-md">
                            {matchingMPProducts
                              ?.filter(
                                (item1) =>
                                  !formData?.mpProducts.some(
                                    (item2) => item2?.name === item1?.name
                                  )
                              )
                              ?.map((product) => (
                                <p
                                  key={product.id}
                                  className="p-2 cursor-pointer hover:bg-gray-100"
                                  onClick={() =>
                                    handleMPProductSelection(product?.name)
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
                          placeholder={`max:${currentMPProduct?.maxQuantity}`}
                          value={currentMPProduct.quantity}
                          onChange={(e) => {
                            setIsAlert({
                              productUsedShow: false,
                              retailShow: false,
                              message: "",
                            });
                            +e.target.value <= currentMPProduct?.maxQuantity
                              ? handleMPQuantityChange(e)
                              : setIsAlert({
                                productUsedShow: true,
                                message: ` You can only select quantity upto ${currentMPProduct?.maxQuantity || ""
                                  } for ${currentMPProduct?.name}`,
                              });
                          }}
                          min={0.01}
                          max={currentMPProduct?.maxQuantity?.toFixed(2)}
                          className="w-full !py-1.5 px-1
                        border-gray-300 border rounded-md"
                        />
                      </td>
                    </tr>
                    {formData.mpProducts?.map((product, index) => (
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
                                retailShow: false,
                                message: "",
                              });
                              +e.target.value <= findProductQuantity(authUserState.user.employees_inventories, product.id)
                                ? handleMPQuantityChange(e, product)
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
                          <button
                            type="button"
                            onClick={() => removeMPProduct(index, product)}
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
                    name="paidByClientMPProducts"
                    className="w-full !py-1.5 px-1 border-gray-300 border rounded-md"
                    min="0"
                    value={Number(formData.paidByClientMPProducts).toString()}
                    onChange={(event) => handleInputChange(event)}
                  />
                </div>
                {isAlert.productUsedShow && (
                  <span className="text-sm">{isAlert?.message}</span>
                )}
              </div>
              <div className="border rounded-lg p-6 my-4 bg-white">
                <div className="flex gap-4 font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                  <label>Did the service go as planned?</label>
                  <label>
                    <input
                      type="radio"
                      name="serviceExperience"
                      value="yes"
                      checked={formData.serviceExperience === true}
                      onChange={handleInputChange}
                      required
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="serviceExperience"
                      value="no"
                      checked={formData.serviceExperience === false}
                      onChange={handleInputChange}
                      required
                    />{" "}
                    No
                  </label>
                </div>
                {formData.serviceExperience===false && (
                  <div className="mt-2">
                    <textarea
                      id="serviceExperienceReason"
                      name="serviceExperienceReason"
                      value={formData.serviceExperienceReason}
                      onChange={(event) =>
                        handleReasonChange(event, "serviceExperienceReason")
                      }
                      required
                      className="mt-2 p-3 w-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      placeholder="Can you explain why the service did not go as planned?"
                    />
                  </div>
                )}

                <div className="flex gap-4 font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                  <label>Do you feel comfortable with the modality yet?</label>
                  <label>
                    <input
                      type="radio"
                      name="comfortWithModality"
                      value="yes"
                      checked={formData.comfortWithModality === true}
                      onChange={handleInputChange}
                      required
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="comfortWithModality"
                      value="no"
                      checked={formData.comfortWithModality === false}
                      onChange={handleInputChange}
                      required
                    />{" "}
                    No
                  </label>
                </div>
                {formData.comfortWithModality===false && (
                  <div className="mt-2">
                    <textarea
                      id="comfortWithModalityReason"
                      name="comfortWithModalityReason"
                      value={formData.comfortWithModalityReason}
                      onChange={(event) =>
                        handleReasonChange(event, "comfortWithModalityReason")
                      }
                      required
                      className="mt-2 p-3 w-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      placeholder="Can you provide more details?"
                    />
                  </div>
                )}

                <div className="flex gap-4 font-medium px-2 p-2 rounded-md hover:bg-cyan-100 transition duration-500">
                  <label>Did your mentor provide value?</label>
                  <label>
                    <input
                      type="radio"
                      name="mentorValueProvided"
                      value="yes"
                      checked={formData.mentorValueProvided === true}
                      onChange={handleInputChange}
                      required
                    />{" "}
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="mentorValueProvided"
                      value="no"
                      checked={formData.mentorValueProvided === false}
                      onChange={handleInputChange}
                      required
                    />{" "}
                    No
                  </label>
                </div>
                {formData.mentorValueProvided===false && (
                  <div className="mt-2">
                    <textarea
                      id="mentorValueProvidedReason"
                      name="mentorValueProvidedReason"
                      value={formData.mentorValueProvidedReason}
                      onChange={(event) =>
                        handleReasonChange(event, "mentorValueProvidedReason")
                      }
                      required
                      className="mt-2 p-3 w-full border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
                      placeholder="Can you please tell us why?"
                    />
                  </div>
                )}
              </div>
              <Loadingbutton
                isLoading={loading}
                className="w-full sm-hidden md:block text-white px-4 py-2 !bg-cyan-400 !border-cyan-500 hover:!bg-cyan-500 focus:!bg-cyan-500"
                title="Submit"
                loadingText={"Adding Invoices..."}
                type="submit"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MPInvoice
