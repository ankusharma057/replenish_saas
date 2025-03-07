import React, { useEffect, useState } from "react";
import { CreateClient, GetClientDetails, getClients, getClientSchedulesOnly, getEmployeesList } from "../../Server";
import { ChevronDown } from "lucide-react";
import SearchInput from "../../components/Input/SearchInput";
import { FixedSizeList as List } from "react-window";
import AsideLayout from "../../components/Layouts/AsideLayout";
import { useAsideLayoutContext } from "../../context/AsideLayoutContext";
import { Button, Form, Container } from "react-bootstrap";
import "../../App.css"
import {
  UserRound,
  Mail,
  Phone,
  Briefcase,
  Home,
  Bell,
  ThumbsUp,
  Settings,
  Megaphone,
  CreditCard,
  Cloud,
  HelpCircle,

} from "lucide-react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ListGroup } from "react-bootstrap";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { Country, State, City } from 'country-state-city';
import { toast } from "react-toastify";
import { useAuthContext } from "../../context/AuthUserContext";
import { useNavigate, useParams } from "react-router-dom";
import Image from 'react-bootstrap/Image';

const ClientsProfileUpdate = () => {
  const params = useParams();
  const Navigate = useNavigate();
  const [employeeList, setEmployeeList] = useState([]);
  const { collapse } = useAsideLayoutContext();
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [currentTab, setCurrentTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [radioTabs, setRadioTabs] = useState([]);
  const [updateEmployeeInput, setUpdateEmployeeInput] = useState({});
  const [showCreateClientModel, setShowCreateClientModel] = useState(false);
  const [selectedClientSchedules, setSelectedClientSchedules] = useState([]);
  const [showPronounceOptions, setShowPronounceOptions] = useState(false);
  const [howHearJob, setHowHearjob] = useState("")
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showHeader, setShowHeader] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [disableCheckbox, setDisableCheckbox] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    middle_name: '',
    preferred_name: '',
    pronouns: '',
    prefix: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    gender: '',
    sex: '',
    date_of_birth: '',
    personal_health_number: '',
    family_doctor: '',
    family_doctor_phone: '',
    family_doctor_email: '',
    referring_professional: '',
    referring_professional_phone: '',
    referring_professional_email: '',
    emergency_contact: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    parent_guardian: '',
    occupation: '',
    employer: '',
    how_heard_about_us: "",
    referred_employee_id: "",
    who_were_you_referred_to_name: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",
  });
  const [checkboxData, setCheckboxData] = useState({
    email_reminder_2_days: false,
    sms_reminder_2_days: false,
    sms_reminder_24_hours: false,
    email_new_cancelled: false,
    email_waitlist_openings: false,
    sms_waitlist_openings: false,
    ok_to_send_marketing_emails: false,
    send_ratings_emails: false,
    do_not_email: false,
    discharged: false,
    deceased: false
  });
  const [phoneNumbers, setPhoneNumbers] = useState({
    home_phone: '',
    work_phone: '',
    mobile_phone: '',
    fax_phone: ''
  });

  const [onlineBookingPolicy, setOnlineBookingPolicy] = useState("");
  const [onlineBookingAllowed, setOnlineBookingAllowed] = useState(false);
  const [onlineBookingDisabled, setOnlineBookingDisabled] = useState(false);

  const [onlineBookingPaymentPolicy, setOnlineBookingPaymentPolicy] = useState();
  const [requiresFullPayment, setRequiresFullPayment] = useState(false);
  const [requiresDeposit, setRequiresDeposit] = useState(false);
  const [requiresCreditCardOnFile, setRequiresCreditCardOnFile] = useState(false);
  const [noPaymentReqired, setNoPaymentReqired] = useState(false);
  const [allEmployeeList, setAllEmployeeList] = useState([]);
  const months = [
    { name: 'January', number: '01' },
    { name: 'February', number: '02' },
    { name: 'March', number: '03' },
    { name: 'April', number: '04' },
    { name: 'May', number: '05' },
    { name: 'June', number: '06' },
    { name: 'July', number: '07' },
    { name: 'August', number: '08' },
    { name: 'September', number: '09' },
    { name: 'October', number: '10' },
    { name: 'November', number: '11' },
    { name: 'December', number: '12' },
  ];


  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const getClientSchedule = async (selectedEmployeeData, refetch = true) => {
    try {
      if (selectedEmployeeData) {
        const { data } = await getClientSchedulesOnly(
          selectedEmployeeData,
          refetch
        );
        setSelectedClientSchedules(data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getEmployesList = async () => {
    let response = await getEmployeesList(true)
    if (response.status === 200) {
      setAllEmployeeList(response.data)
    } else {
      toast.error("Something went wrong")
    }
  };

  useEffect(() => {
    const countryList = Country.getAllCountries();
    setCountries(countryList);
    getEmployees();
    getClientSchedule(selectedEmployeeData?.id, true);
    getEmployesList();
  }, [selectedEmployeeData?.id,]);

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
        handleSelect(newData[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredEmployeeList = employeeList?.filter((employee) =>
    employee?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleSelect = (emp) => {
    setSelectedEmployeeData(emp);
    setRadioTabs([]);
    setUpdateEmployeeInput({});
    setCurrentTab(emp.is_admin ? "invoice" : "profile");
    let addTabs = [];
    if (emp.is_admin || emp.is_inv_manager) {
      addTabs.splice(0, 0, {
        name: "Inventories",
        value: "inventory",
        data: getEmployees,
      });
    }
    if (!emp.is_admin) {
      addTabs.splice(0, 0, { name: "Profile", value: "profile" });
      addTabs.push({ name: "Edit/Settings", value: "settings" });
      addTabs.push({ name: "Forms", value: "Forms" });
      addTabs.push({ name: "Appointments", value: "Appointments" });
      addTabs.push({ name: "Billing", value: "Billing" });
      addTabs.push({ name: "Messages", value: "Messages" });
      addTabs.push({ name: "Files", value: "Files" });
      addTabs.push({ name: "Groups", value: "Groups" });
    }
    addTabs.splice(3, 0, { name: "Chart Entries", value: "chart_entries" });
    setRadioTabs(addTabs);
  };

  const handleNavigateToClient = (customerId) => {
    Navigate(`/customers/${customerId}`)
  };

  function getInitials(str) {
    const words = str.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    } else if (words.length === 1) {
      return words[0][0];
    }
    return "";
  }

  const EmployeeItem = ({ index, style }) => {
    const employee = filteredEmployeeList[index];
    return (
      employee && (
        <div
          style={style}
          onClick={() => {
            selectedEmployeeData?.id !== employee.id && handleSelect(employee);
            if (window.innerWidth < 1024) {
              collapse();
            }
            handleNavigateToClient(employee.id)
          }}
          className={`p-2 border-b transition-all hover:bg-gray-200 rounded-md duration-700 cursor-pointer"`}
        >
          <div className="d-flex justify-content-start align-items-center gap-[5px]">
            {employee.profile_photo_url ?
              <Image
                roundedCircle
                src={employee.profile_photo_url}
                style={{ width: "35px", height: "35px" }}
              /> :
              <div className="w-[35px] h-[35px] rounded-circle d-flex justify-content-center align-items-center border bg-white">
                <p className="mb-0 fs-6 d-flex justify-content-center align-items-center">{getInitials(employee?.name)}</p>
              </div>
            }
            {employee.name || ""}
          </div>
        </div>
      )
    );
  };

  const handleFormChange = (event) => {
    const { name, value } = event?.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };
  useEffect(() => {}, [formData]);

  const handleChange = (value, name) => {
    setPhoneNumbers(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleProunounsChange = (pronouns) => {
    formData.pronouns = pronouns
    setFormData(formData)
  };

  const handleCountryChange = (event) => {
    const selectedCountryObj = Country.getAllCountries().find(country => country.name === event.target.value);
    if (selectedCountryObj) {
      formData.country = selectedCountryObj.name
      setFormData(formData)
      setSelectedCountry(selectedCountryObj.name);
      setSelectedCountryCode(selectedCountryObj.isoCode);
      setSelectedState('');
      setCities([]);
      formData.country = event.target.value
      setFormData(formData)
      const stateList = State.getStatesOfCountry(selectedCountryObj.isoCode);
      setStates(stateList);
      formData.state = selectedCountryObj.name
      setFormData(formData);
    } else {
      setSelectedCountry("");
      setSelectedCountryCode("");
    }
  };

  const handleStateChange = (event) => {
    const stateName = event.target.value;
    const selectedStateObj = states.find(state => state.name === stateName);
    if (selectedStateObj) {
      formData.state = stateName
      setFormData(formData)
      setSelectedState(stateName);
      const updatedFormData = { ...formData, state: selectedStateObj.name };
      setFormData(updatedFormData);
      const cityList = City.getCitiesOfState(selectedStateObj.countryCode, selectedStateObj.isoCode)
      setCities(cityList);
    } else {
      setSelectedState("");
      setCities([]);
    }
  };

  const handleCityChange = (event) => {
    const city = event.target.value;
    setSelectedCity(city);
    formData.city = city
    setFormData(formData)
    formData.city = city
    setFormData(formData)
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxData((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
    if (name === "do_not_email") {
      let checkboxPayload = {
        email_reminder_2_days: false,
        sms_reminder_2_days: false,
        sms_reminder_24_hours: false,
        email_new_cancelled: !checkboxData.email_new_cancelled,
        email_waitlist_openings: !checkboxData.email_waitlist_openings,
        sms_waitlist_openings: false,
        ok_to_send_marketing_emails: !checkboxData.ok_to_send_marketing_emails,
        do_not_email: !checkboxData.do_not_email,
      }
      setCheckboxData(checkboxPayload)
      setDisableCheckbox(true)

    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataPayload = new FormData();
   
    // Client basic information
    formDataPayload.append('client[name]', formData?.name);
    formDataPayload.append('client[email]', formData?.email);
    formDataPayload.append('client[last_name]', formData?.last_name);
    formDataPayload.append('client[preferred_name]', formData?.preferred_name);
    formDataPayload.append('client[pronouns]', formData?.pronouns);
    formDataPayload.append('client[prefix]', formData?.prefix);
    formDataPayload.append('client[middle_name]', formData?.middle_name);
    formDataPayload.append('client[address]', formData?.address);
    formDataPayload.append('client[phone_number]', phoneNumbers.mobile_phone);

    // // // // Client detail attributes
    formDataPayload.append('client[client_detail_attributes][city]', selectedCity);
    formDataPayload.append('client[client_detail_attributes][state]', formData.state);
    formDataPayload.append('client[client_detail_attributes][zip_code]', formData.zip_code);
    formDataPayload.append('client[client_detail_attributes][country]', formData.country);
    formDataPayload.append('client[client_detail_attributes][gender]', formData.gender);
    formDataPayload.append('client[client_detail_attributes][sex]', formData.sex);
    if(formData.dobYear ||formData.dobMonth ||formData.dobDay){
      if(formData.dobYear !== "" ||formData.dobMonth !== "" ||formData.dobDay !== ""){
        formDataPayload.append('client[client_detail_attributes][date_of_birth]', `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`);
      }
    }
    // // // Phone numbers
    formDataPayload.append('client[client_detail_attributes][home_phone]', phoneNumbers.home_phone);
    formDataPayload.append('client[client_detail_attributes][mobile_phone]', phoneNumbers.mobile_phone);
    formDataPayload.append('client[client_detail_attributes][work_phone]', phoneNumbers.work_phone);
    formDataPayload.append('client[client_detail_attributes][fax_phone]', phoneNumbers.fax_phone);
    // // // contact details
    formDataPayload.append('client[client_detail_attributes][personal_health_number]', formData.personal_health_number);
    formDataPayload.append('client[client_detail_attributes][family_doctor]', formData.family_doctor);
    formDataPayload.append('client[client_detail_attributes][family_doctor_phone]', formData.family_doctor_phone);
    formDataPayload.append('client[client_detail_attributes][family_doctor_email]', formData.family_doctor_email);
    
    formDataPayload.append('client[client_detail_attributes][referring_professional]', formData.referring_professional);
    formDataPayload.append('client[client_detail_attributes][referring_professional_phone]', formData.referring_professional_phone);
    formDataPayload.append('client[client_detail_attributes][referring_professional_email]', formData.referring_professional_email);
    formDataPayload.append('client[client_detail_attributes][emergency_contact]', formData.emergency_contact);
    formDataPayload.append('client[client_detail_attributes][emergency_contact_phone]', formData.emergency_contact_phone);
    formDataPayload.append('client[client_detail_attributes][emergency_contact_relationship]', formData.emergency_contact_relationship);
    formDataPayload.append('client[client_detail_attributes][parent_guardian]', formData.parent_guardian);
    formDataPayload.append('client[client_detail_attributes][occupation]', formData.occupation);
    formDataPayload.append('client[client_detail_attributes][employer]', formData.employer);

    // Schedules attributes and notification settings    
    formDataPayload.append('client[notification_settings][email_reminder_2_days]', checkboxData?.email_reminder_2_days);
    formDataPayload.append('client[notification_settings][sms_reminder_2_days]', checkboxData?.sms_reminder_2_days);
    formDataPayload.append('client[notification_settings][sms_reminder_24_hours]', checkboxData?.sms_reminder_24_hours);
    formDataPayload.append('client[notification_settings][email_new_cancelled]', checkboxData?.email_new_cancelled);
    formDataPayload.append('client[notification_settings][email_waitlist_openings]', checkboxData?.email_waitlist_openings);
    formDataPayload.append('client[notification_settings][sms_waitlist_openings]', checkboxData?.sms_waitlist_openings);
    formDataPayload.append('client[notification_settings][ok_to_send_marketing_emails]', checkboxData?.ok_to_send_marketing_emails);
    formDataPayload.append('client[notification_settings][send_ratings_emails]', checkboxData?.send_ratings_emails);
    formDataPayload.append('client[notification_settings][do_not_email]', checkboxData?.do_not_email);

    // Who were you referred to?
    formDataPayload.append('client[referred_employee_id]', formData?.referred_employee_id);

    //online booking policy
    formDataPayload.append('client[online_booking_policy][online_booking_allowed]', onlineBookingAllowed);
    formDataPayload.append('client[online_booking_policy][online_booking_disabled]', onlineBookingDisabled);

    //online booking policy payments
    formDataPayload.append('client[online_booking_payment_policy][no_payment_reqired', noPaymentReqired);
    formDataPayload.append('client[online_booking_payment_policy][requires_deposit]', requiresDeposit);
    formDataPayload.append('client[online_booking_payment_policy][requires_full_payment]', requiresFullPayment);
    formDataPayload.append('client[online_booking_payment_policy][requires_credit_card_on_file]', requiresCreditCardOnFile);

    //how you heard
    formDataPayload.append('client[how_heard_about_us]', formData?.how_heard_about_us);

    //profile photo
    if (selectedFiles.length > 0) {
      formDataPayload.append('client[profile_photo]', selectedFiles[0]);
    }
    try {
      let response = await CreateClient(params.id, true, formDataPayload);
     
      if (response.status === 200) {
        toast.success("Client Created Successfully");
        Navigate(`/customers/${response.data.id}`)
        try {
          const { data } = await getClients();
          if (data?.length > 0) {
            const newData = data.filter((client) => client?.email !== null && client?.email !== undefined && client?.email.trim() !== "");
            setEmployeeList(newData);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        if (response.error.email) {
          toast.error(response.error.email)
        }
        toast.error("Something went wrong")
      }
    } catch (error) {
      toast.error(error.response.data.error.email[0])
    }
  };

  const handleNavigate = () => {
    Navigate("/customers/1")
  };

  const handleWhoRefered = async (event) => {
    const selectedName = await event.target.value;
    const employee = allEmployeeList.find((employee) => employee.name === selectedName);

    if (employee) {
      await setFormData((prevState) => ({
        ...prevState,
        referred_employee_id: employee.id,
        who_were_you_referred_to_name: selectedName,
      }));

    }
  };

  const handleOnlineBookingPolicyChange = (e) => {

    if (e.target.value === "Online booking allowed") {
      setOnlineBookingAllowed(true)
      setOnlineBookingDisabled(false)
      setOnlineBookingPolicy(e.target.value)
    }
    if (e.target.value === "Online booking disabled") {
      setOnlineBookingAllowed(false)
      setOnlineBookingDisabled(true)
      setOnlineBookingPolicy(e.target.value)
    }
  };

  useEffect(() => { }, [onlineBookingAllowed, onlineBookingDisabled, onlineBookingPolicy])

  const handleOnlineBookingPaymentPolicyChange = (e) => {
    if (e.target.value === "Online booking requires full payment") {
      setRequiresFullPayment(true);
      setRequiresDeposit(false);
      setRequiresCreditCardOnFile(false)
      setNoPaymentReqired(false)

    }
    if (e.target.value === "Online booking requires a deposit") {
      setRequiresFullPayment(false);
      setRequiresDeposit(true);
      setRequiresCreditCardOnFile(false)
      setNoPaymentReqired(false)
      setOnlineBookingPaymentPolicy(e.target.value)
    }
    if (e.target.value === "Online booking requires a credit card on file") {
      setRequiresFullPayment(false);
      setRequiresDeposit(false);
      setRequiresCreditCardOnFile(true)
      setNoPaymentReqired(false)
      setOnlineBookingPaymentPolicy(e.target.value)
    }
    if (e.target.value === "No payment requirements for online booking") {
      setRequiresFullPayment(false);
      setRequiresDeposit(false);
      setRequiresCreditCardOnFile(false)
      setNoPaymentReqired(true)
      setOnlineBookingPaymentPolicy(e.target.value)
    }
  };

  const handleAddNewClient = (clientData) => {
    Navigate(`/add-new-client`)
  };

  return (
    <>
      <AsideLayout
        asideContent={
          <>
            <div>
              <SearchInput
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="border-t-2  py-2 bg-white h-80vh">
              <h1 className="text-xl flex gap-x-2 items-center justify-center">
                Clients <ChevronDown />
              </h1>
              <div className="flex h-[58vh] flex-col pl-2 gap-4 overflow-y-auto border">
                {(employeeList || []).length > 0 && (
                  <List
                    height={window.innerHeight}
                    itemCount={employeeList.length}
                    itemSize={45}
                    width={"100%"}
                  >
                    {EmployeeItem}
                  </List>
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                handleAddNewClient()
              }}
              variant="info"
              className="w-full text-white"
            >
              + Add Client
            </Button>
          </>
        }
      >
        <div className="flex-1 border p-3 h-[86vh] overflow-scroll">
          <Form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between mb-3">
              <h1 className="text-secondary fw-light">
                New Client
              </h1>
              <div className="d-flex justify-content-between gap-2">
                <Button variant="outline-secondary w-[100px] h-[40px] fs-6" onClick={handleNavigate}>Cancel</Button>
                <Button variant="btn btn-primary w-[100px] h-[40px]" type="submit" style={{ backgroundColor: "#0dcaf0", border: "none" }} >Save</Button>
              </div>
            </div>
            <div className="d-flex p-4 border bg-white rounded">
              <div>
                <UserRound />
              </div>
              <div className="w-50 d-flex justify-content-between gap-1 ">
                <Container>
                  <Row xs={6} md={6} lg={6}>
                    <Col md={3} className={"w-50"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">First Name - <em>Required</em></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="First Name"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className={"w-50"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Last Name - <em>Required</em></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Last Name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className={"w-50"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary d-flex justify-content-start align-items-center gap-2">Preffered Name <HelpCircle size={15} /></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Preffered Name"
                          name="preferred_name"
                          value={formData.preferred_name}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className={"w-50 position-relative"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Pronouns</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Pronouns"
                          value={formData.pronouns}
                          onFocus={() => setShowPronounceOptions(true)}
                          onBlur={() => setShowPronounceOptions(false)}
                        />
                      </Form.Group>
                      {showPronounceOptions && (
                        <div className="position-absolute w-[90%]">
                          <ListGroup>
                            <ListGroup.Item onMouseDown={() => handleProunounsChange("He/Him/His")}>He/Him/His</ListGroup.Item>
                            <ListGroup.Item onMouseDown={() => handleProunounsChange("She/Her/Hers")}>She/Her/Hers</ListGroup.Item>
                            <ListGroup.Item onMouseDown={() => handleProunounsChange("They/Them/Theirs")}>They/Them/Theirs</ListGroup.Item>
                            <ListGroup.Item onMouseDown={() => handleProunounsChange("Thon/Thon/Thon's")}>Thon/Thon/Thon's</ListGroup.Item>
                            <ListGroup.Item onMouseDown={() => handleProunounsChange("E/Em/Ems")}>E/Em/Ems</ListGroup.Item>
                            <ListGroup.Item onMouseDown={() => handleProunounsChange("Ae/Aer/Aers")}>Ae/Aer/Aers</ListGroup.Item>
                          </ListGroup>
                        </div>
                      )}
                    </Col>
                    <Col md={3} className={"w-50"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Prefix</Form.Label>
                        <Form.Select
                          name="prefix"
                          value={formData.prefix}
                          onChange={handleFormChange}
                        >
                          <option value="">Select a title...</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Miss">Miss</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Mx.">Mx.</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className={"w-50"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Middle</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Middle"
                          name="middle_name"
                          value={formData.middle_name}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
                <div></div>
              </div>

            </div>
            <div className="d-flex p-4 border bg-white mt-3 rounded">
              <div>
                <Mail />
              </div>
              <div className="w-100">
                <Container>
                  <Row xs={6} md={6} lg={6}>
                    <Col md={6} className={"w-50"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Email</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Email Address"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
            <div className="d-flex p-4 border bg-white rounded mt-3">
              <div>
                <Phone />
              </div>
              <div className="w-100 d-flex justify-content-between gap-1 ">
                <Container>
                  <Row xs={6} md={6} lg={6}>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary d-flex justify-content-start align-items-center gap-2">Home Phone<HelpCircle size={15} /></Form.Label>
                        <div className="countrySelectContainer">
                          <PhoneInput
                            country={'us'}
                            value={phoneNumbers?.home_phone}
                            onChange={(value) => handleChange(value, 'home_phone')}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary d-flex justify-content-start align-items-center gap-2">Mobile Phone <HelpCircle size={15} /></Form.Label>
                        <div className="countrySelectContainer">
                          <PhoneInput
                            country={'us'}
                            value={phoneNumbers.mobile_phone}
                            onChange={(value) => handleChange(value, 'mobile_phone')}
                          />
                        </div>                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary d-flex justify-content-start align-items-center gap-2">Work Phone<HelpCircle size={15} /></Form.Label>
                        <div className="countrySelectContainer">
                          <PhoneInput
                            country={'us'}
                            value={phoneNumbers.work_phone}
                            onChange={(value) => handleChange(value, 'work_phone')}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary d-flex justify-content-start align-items-center gap-2">Fax Phone<HelpCircle size={15} /></Form.Label>
                        <div className="countrySelectContainer">
                          <PhoneInput
                            country={'us'}
                            value={phoneNumbers.fax_phone}
                            onChange={(value) => handleChange(value, 'fax_phone')}
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
                <div>
                  <Home />
                </div>
                <Container>
                  <Row xs={12} sm={12} md={12} lg={12}>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Street Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Suite Number (i.e Suite#100)"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Country</Form.Label>
                        <Form.Select value={selectedCountry} onChange={handleCountryChange}>
                          <option value="">Select a country</option>
                          {countries.map((country) => (
                            <option key={country.isoCode} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">State</Form.Label>
                        <Form.Select
                          value={selectedState}
                          onChange={handleStateChange}
                          disabled={!selectedCountry}
                        >
                          <option value="">Select a state</option>
                          {states.map(state => (
                            <option key={state.isoCode} value={state.name}>
                              {state.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">City</Form.Label>
                        <Form.Select
                          disabled={!selectedState}
                          value={selectedCity}
                          onChange={handleCityChange}
                        >
                          <option value="">Select a city</option>
                          {cities.map(city => (
                            <option key={city.id} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Zip Code</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Zip Code"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
            <div className="d-flex p-4 border bg-white rounded mt-3">
              <div>
                <Briefcase />
              </div>
              <div className="w-100 d-flex justify-content-between gap-1 ">
                <Container>
                  <Row xs={6} md={6} lg={6}>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Check
                          type={"checkbox"}
                          label={`Discharged`}
                          name="discharged"
                          checked={checkboxData.discharged}
                          onChange={handleCheckboxChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Check type={"checkbox"} label={"Deceased"}
                          name="deceased"
                          checked={checkboxData.deceased}
                          onChange={handleCheckboxChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Birth Date</Form.Label>
                        <div className="d-flex justify-content-between gap-2">
                          <Form.Group controlId="formFile " className="w-[75%]">
                            <Form.Label className="text-body-tertiary">Month</Form.Label>
                            <Form.Select
                              name="dobMonth"
                              value={formData.dobMonth}
                              onChange={handleFormChange}>
                              <option>{"Select a month"}</option>
                              {months.map((month, index) => (
                                <option key={index} value={month.number}>
                                  {month.name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          <Form.Group controlId="formFile">
                            <Form.Label className="text-body-tertiary">Day</Form.Label>
                            <Form.Control
                              type="number"
                              name="dobDay"
                              value={formData.dobDay}
                              onChange={handleFormChange}
                            />
                          </Form.Group>
                          <Form.Group controlId="formFile">
                            <Form.Label className="text-body-tertiary">Year</Form.Label>
                            <Form.Control
                              type="number"
                              name="dobYear"
                              value={formData.dobYear}
                              onChange={handleFormChange}
                            />
                          </Form.Group>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Personal Health Number</Form.Label>
                        <Form.Control
                          type="number"
                          name="personal_health_number"
                          value={formData.personal_health_number}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Family Doctor</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Family Doctor Name"
                          name="family_doctor"
                          value={formData.family_doctor}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <div className="d-flex justify-content-between gap-[20px]">
                        <Form.Group controlId="formFile" className="mb-3 w-100">
                          <Form.Label className="text-body-tertiary">Phone</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Phone"
                            name="family_doctor_phone"
                            value={formData.family_doctor_phone}
                            onChange={handleFormChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formFile" className="mb-3 w-100">
                          <Form.Label className="text-body-tertiary">Email</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Email"
                            name="family_doctor_email"
                            value={formData.family_doctor_email}
                            onChange={handleFormChange}
                          />
                        </Form.Group>
                      </div>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Referring Professional</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Emergency Contact"
                          name="referring_professional"
                          value={formData.referring_professional}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <div className="d-flex justify-content-between gap-[20px]">
                        <Form.Group controlId="formFile" className="mb-3 w-100">
                          <Form.Label className="text-body-tertiary">Phone</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Phone"
                            name="referring_professional_phone"
                            value={formData.referring_professional_phone}
                            onChange={handleFormChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formFile" className="mb-3 w-100">
                          <Form.Label className="text-body-tertiary">Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="referring_professional_email"
                            value={formData.referring_professional_email}
                            onChange={handleFormChange}
                          />
                        </Form.Group>
                      </div>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Emergency Contact</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter Emergency Contact"
                          name="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <div className="d-flex justify-content-between gap-[20px]">
                        <Form.Group controlId="formFile" className="mb-3 w-100">
                          <Form.Label className="text-body-tertiary">Phone</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Phone"
                            name="emergency_contact_phone"
                            value={formData.emergency_contact_phone}
                            onChange={handleFormChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formFile" className="mb-3 w-100">
                          <Form.Label className="text-body-tertiary">Relationship</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Relationship"
                            name="emergency_contact_relationship"
                            value={formData.emergency_contact_relationship}
                            onChange={handleFormChange}
                          />
                        </Form.Group>
                      </div>
                    </Col>
                  </Row>
                </Container>
                <div></div>
                <Container>
                  <Row xs={12} sm={12} md={12} lg={12}>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary d-flex justify-content-start align-items-center gap-2">Gender <HelpCircle size={15} /></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Gender"
                          name="gender"
                          value={formData.gender || ""}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary d-flex justify-content-start align-items-center gap-2">Sex<HelpCircle size={15} /></Form.Label>
                        <Form.Select
                          name="sex"
                          value={formData.sex || ""}
                          onChange={handleFormChange}>
                          <option >{"Select Option"}</option>
                          <option value={"Male"}>{"Male"}</option>
                          <option value={"Female"}>{"Female"}</option>
                          <option value={"X"}>{"X"}</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Parent / Guardian</Form.Label>
                        <Form.Control type="text"
                          name="parent_guardian"
                          value={formData.parent_guardian}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Occupation</Form.Label>
                        <Form.Control type="text"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <hr className="hr w-100" />
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Employer</Form.Label>
                        <Form.Control type="text"
                          name="employer"
                          value={formData.employer}
                          onChange={handleFormChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
            <div className="p-4 border bg-white rounded mt-3">
              <div className="d-flex">
                <div>
                  <Bell />
                </div>
                <div className="w-100 d-flex justify-content-between gap-1 ">
                  <Container>
                    <Row xs={6} md={6} lg={6}>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Label className="text-body-tertiary">Reminders</Form.Label>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={`Email 2 days before appointment`}
                            name="email_reminder_2_days"
                            checked={checkboxData.email_reminder_2_days}
                            onChange={handleCheckboxChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={`Text Message (SMS) 2 days before appointment`}
                            name="sms_reminder_2_days"
                            checked={checkboxData.sms_reminder_2_days}
                            onChange={handleCheckboxChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={`Text Message (SMS) 24 hours before appointment`}
                            name="sms_reminder_24_hours"
                            checked={checkboxData.sms_reminder_24_hours}
                            onChange={handleCheckboxChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Label className="text-body-tertiary">Notifications</Form.Label>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={"Email notifications of new, cancelled and rescheduled appointments"}
                            name="email_new_cancelled"
                            checked={checkboxData.email_new_cancelled}
                            onChange={handleCheckboxChange}
                            disabled={disableCheckbox}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Label className="text-body-tertiary">Waitlist Notifications</Form.Label>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={"Email notifications of wait list openings"}
                            name="email_waitlist_openings"
                            checked={checkboxData.email_waitlist_openings}
                            onChange={handleCheckboxChange}
                            disabled={disableCheckbox}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={"SMS notifications of wait list openings"}
                            name="sms_waitlist_openings"
                            checked={checkboxData.sms_waitlist_openings}
                            onChange={handleCheckboxChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Container>
                  <div>
                    <ThumbsUp />
                  </div>
                  <Container>
                    <Row xs={12} sm={12} md={12} lg={12}>
                      <Col md={3} className={"w-100 position-relative"}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Label className="text-body-tertiary">How did you hear about us?</Form.Label>
                          <Form.Control
                            type="search"
                            name="how_heard_about_us"
                            value={formData.how_heard_about_us}
                            onChange={handleFormChange}
                          />
                        </Form.Group>
                        {howHearJob.length > 0 && (
                          <div className="position-absolute w-[90%] bg-white layer-2">
                            <ListGroup>
                              <ListGroup.Item className="bg-white">
                                He/Him/His
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-white">
                                She/Her/Hers
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-white">
                                They/Them/Theirs
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-white">
                                Thon/Thon/Thon's
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-white">
                                E/Em/Ems
                              </ListGroup.Item>
                              <ListGroup.Item className="bg-white">
                                Ae/Aer/Aers
                              </ListGroup.Item>
                            </ListGroup>
                          </div>
                        )}
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Label className="text-body-tertiary">Who were you referred to?</Form.Label>
                          <Form.Select
                            name="who_were_you_referred_to_name"
                            value={formData.who_were_you_referred_to_name}
                            onChange={handleWhoRefered}
                          >
                            <option value="">Select Option...</option>
                            {allEmployeeList.map((employee) => (
                              <option key={employee.id} value={employee.name}>
                                {employee.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Container>
                </div>
              </div>
              <div className="d-flex">
                <div>
                  <Megaphone />
                </div>
                <div className="w-100 d-flex justify-content-between gap-1 ">
                  <Container>
                    <Row xs={6} md={6} lg={6}>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Label className="text-body-tertiary">Marketing Emails</Form.Label>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={`OK to Send Marketing Emails`}
                            name="ok_to_send_marketing_emails"
                            checked={checkboxData.ok_to_send_marketing_emails}
                            onChange={handleCheckboxChange}
                            disabled={disableCheckbox}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={`Send Ratings Emails`}
                            name="send_ratings_emails"
                            checked={checkboxData.send_ratings_emails}
                            onChange={handleCheckboxChange}
                            disabled={disableCheckbox}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Container>
                  <div></div>
                </div>
              </div>
              <div className="d-flex">
                <div>
                  <Settings />
                </div>
                <div className="w-100 d-flex justify-content-between gap-1 ">
                  <Container>
                    <Row xs={6} md={6} lg={6}>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Label className="text-body-tertiary">All Email Settings</Form.Label>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group controlId="formFile" className="mb-3">
                          <Form.Check
                            type={"checkbox"}
                            label={`Do Not Email!`}
                            name="do_not_email"
                            checked={checkboxData.do_not_email}
                            onChange={handleCheckboxChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Container>
                  <div></div>
                </div>
              </div>
            </div>
            <div className="d-flex p-4 border bg-white rounded mt-3a">
              <div>
                <Cloud />
              </div>
              <div className="w-100 d-flex justify-content-between gap-1 ">
                <Container>
                  <Row xs={12} sm={12} md={12} lg={12}>
                    <Col md={12} className={"w-100"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Online Booking Policy</Form.Label>
                        <Form.Select
                          name="online_Booking_Policy"
                          value={onlineBookingPolicy}
                          onChange={handleOnlineBookingPolicyChange}
                        >
                          <option>Select Option</option>
                          <option value="Online booking allowed">Online booking allowed</option>
                          <option value="Online booking disabled">Online booking disabled</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
                <div>
                  <CreditCard />
                </div>
                <Container>
                  <Row xs={12} sm={12} md={12} lg={12}>
                    <Col md={12} className={"w-100"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Online Booking Payment Policy</Form.Label>
                        <Form.Select
                          value={onlineBookingPaymentPolicy}
                          onChange={handleOnlineBookingPaymentPolicyChange}
                        >
                          <option >Select Option</option>
                          <option value="Online booking requires full payment">Online booking requires full payment</option>
                          <option value="Online booking requires a deposit">Online booking requires a deposit</option>
                          <option value="Online booking requires a credit card on file">Online booking requires a credit card on file</option>
                          <option value="No payment requirements for online booking">No payment requirements for online booking</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
            <div className="d-flex p-4 border bg-white rounded mt-3a">
              <div className="w-100 d-flex justify-content-between gap-1 ">
                <Container>
                  <Row xs={12} sm={12} md={12} lg={12}>
                    <Col md={12} className={"w-100"}>
                      <Form.Group controlId="formFile" className="mb-3">
                        <Form.Label className="text-body-tertiary">Profile Photo</Form.Label>
                        <div>
                          <div
                            className="dotted-border border-secondary d-flex justify-content-center align-items-center flex-column rounded w-[120px] p-2 h-[120px]"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            style={{ textAlign: "center", cursor: "pointer", borderStyle: "dashed", border: "1px dashed" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-arrow-up"><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="M12 16V8" /></svg>
                            <span>Drag & Drop to upload</span>
                            <input
                              type="file"
                              id="fileUpload"
                              multiple
                              className="d-none"
                              onChange={handleFileSelect}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="fileUpload"
                              className="btn w-[150px] mt-1 btn-outline-secondary d-flex justif"
                            >
                              <Image />Select Photo
                            </label>
                            <input
                              type="file"
                              id="fileUpload"
                              multiple
                              className="d-none"
                              onChange={handleFileSelect}
                            />
                          </div>

                          {selectedFiles.length > 0 && (
                            <div className="mt-3">
                              <h6>Selected Files:</h6>
                              <ul className="list-group">
                                {selectedFiles.map((file, index) => (
                                  <li key={index} className="list-group-item">
                                    {file.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
            <div className="d-flex p-4 border bg-white rounded mt-3a w-100">
              <div className="d-flex justify-content-end  w-100">
                <div className="d-flex justify-content-between gap-2">
                  <Button variant="outline-secondary w-[100px] h-[40px] fs-6" onClick={handleNavigate}>Cancel</Button>
                  <Button variant="btn btn-primary w-[100px] h-[40px]" type="submit" style={{ backgroundColor: "#0dcaf0", border: "none" }} >Save</Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </AsideLayout>
    </>
  );
};

export default ClientsProfileUpdate;
