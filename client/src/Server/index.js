import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import { template } from "lodash";

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000, // 15 min,
  exclude: {
    // Only exclude PUT, PATCH and DELETE methods from cache
    methods: ["put", "patch", "delete", "post"],
  },
});
const api = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
  adapter: cache.adapter,
});

export const getHealth = async (refetch) =>
  api.get("/api/health_check.json", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getUpdatedUserProfile = async (refetch) =>
  api.get("/api/employees/myprofile", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClientProfile = async (refetch) =>
  api.get("/api/client/profile", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClients = async (employee_id, refetch) =>
  api.get("/api/clients", {
    cache: {
      ignoreCache: refetch,
    },
    params: {
      employee_id,
    },
  });

export const getClientsOnly = async (employee_id, refetch) =>
api.get("/api/schedule_clients", {
  cache: {
    ignoreCache: refetch,
  },
  params: {
    employee_id,
  },
});

export const getIntakeForms = async (refetch) =>
  api.get("/api/intake_forms", {
    cache: {
      ignoreCache: refetch,
    }
  });

export const getIntakeForm = async (id, refetch) =>
  api.get(`/api/intake_forms/${id}`, {
    cache: {
      ignoreCache: refetch,
    }
  });

export const getClientIntakeForm = async (id, refetch) =>
  api.get(`/api/client/intake_forms/${id}`, {
    cache: {
      ignoreCache: refetch,
    }
  });

export const getResponseIntakeForm = async (id, refetch) =>
  api.get(`/api/response_intake_forms/${id}`, {
    cache: {
      ignoreCache: refetch,
    }
  });

export const getQuestionnaire = async (id, refetch) =>
  api.get(`/api/questionnaires/${id}`, {
    cache: {
      ignoreCache: refetch,
    }
  });

export const getQuestionnaires = async (refetch) =>
  api.get("/api/questionnaires", {
    cache: {
      ignoreCache: refetch,
    }
  });

export const getInventoryList = async (refetch) =>
  api.get("/api/inventories", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getTreatmentIntakeForms = async (treatment_id, refetch) =>
  api.get(`/api/intake_forms?treatment_id=${treatment_id}`, {
    cache: {
      ignoreCache: refetch,
    }
  });

export const getInvoiceList = async (refetch) =>
  api.get("/api/invoices", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getEmployeeInvoicesOnly = async (employee_id, refetch) =>
  api.get(`/api/employee_invoices?employee_id=${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getEmployeeMentorshipInvoicesOnly = async (employee, refetch = false) => {
  try {
    const response = await api.get(`/api/mentorship_invoices`, {
      params: { is_admin: employee?.is_admin, employee_id: employee?.id },
      cache: {
        ignoreCache: refetch,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching mentorship invoices:', error);
    throw error;
  }
};

export const getAllInvoiceList = async (data, refetch) =>
  api.get("/api/invoice_lists", {
    cache: {
      ignoreCache: refetch,
    },
    params: {
      ...data,
    },
  });

export const deleteInvoice = async (id, refetch) =>
  api.delete(`/api/invoices/${id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getProductsList = async (refetch) =>
  api.get("/api/products", {
    cache: {
      ignoreCache: refetch,
    },
  });
  
export const getTreatmentsList = async (employee_id, refetch) =>
  api.get(`/api/treatments?employee_id=${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });


export const getProductsListWithId = async (refetch, id) =>
  api.get(`/api/products?employee_id=${id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getEmployeesList = async (refetch = false) =>
  api.get("/api/employees", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getEmployeesOnly = async (refetch = false) =>
  api.get("/api/employees_only", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getEmployeesListOnly = async (refetch = false) =>
  api.get("/api/employee_schedules", {
    cache: {
      ignoreCache: refetch,
    },
  });

  export const getTreatmentProductsOnly = async (refetch = false) =>
    api.get("/api/treatment_products", {
      cache: {
        ignoreCache: refetch,
      },
    });

export const getMentorList = async (refetch = false, employeeId) =>
  api.get(`/api/employees?type=mentor${employeeId ? `&mentor_for_employee_id=${employeeId}` : ''}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClientEmployeesList = async (refetch = false) =>
  api.get("/api/client/employees", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClientEmployee = async (employee_id, refetch = false) =>
  api.get(`/api/client/employees/${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClientEmployeeSchedule = async (employee_id, refetch = false) =>
  api.get(`/api/client/schedules?employee_id=${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClientSchedules = async (client_id, refetch = true) =>
  api.get(`/api/client_schedules?client_id=${client_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClientSchedulesOnly = async (client_id, refetch = true) =>
  api.get(`/api/client_schedules_only?client_id=${client_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

  export const getEmployeeAvailablities = async (data, refetch = false) =>
    api.get(`api/availabilities`, {
      cache: {
        ignoreCache: refetch,
      },
      params: {
        ...data,
      },
    });

export const getClientEmployeeAvailability = async (
  employee_id,
  refetch = false
) =>
  api.get(`/api/client/employee_unavailability?employee_id=${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getLocations = async (refetch = false) =>
  api.get("/api/locations", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getLocationsOnly = async (refetch = false) =>
  api.get("/api/schedule_locations", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getLocationsWithoutEmployee = async (
  employee_id,
  refetch = false
) =>
  api.get(`/api/locations?skip_by_employee_id=${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getLocationsWithoutEmployeeOnly = async (
  employee_id,
  refetch = false
) =>
  api.get(`/api/schedule_locations?skip_by_employee_id=${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

  export const getEmployeeLocations = async (
    employee_id,
    refetch = false
  ) =>
    api.get(`/api/locations?employee_id=${employee_id}`, {
      cache: {
        ignoreCache: refetch,
      },
    });

export const getEmployeeLocationsOnly = async (
  employee_id,
  refetch = false
) =>
  api.get(`/api/schedule_locations?employee_id=${employee_id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getClientLocations = async (refetch = false) =>
  api.get("/api/client/locations", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getLocationEmployee = async (locationId, refetch = false) =>
  api.get(`api/client/locations/${locationId}/employees`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getLocationEmployeeOnly = async (locationId, refetch = false) =>
  api.get(`api/locations/${locationId}/employees`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getAllLocationAndEmployee = async (locationId, refetch = false) =>
  api.get(`api/client/locations`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const downloadInvoice = async (invoiceID) =>
  api.get(`/api/invoices/${invoiceID}/download_attachment`, {
    responseType: "blob",
  });

export const getRequestInventory = async (refetch) =>
  await api.get(`/api/inventory_requests`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const sendResetPasswordLinkRoute = async (data) =>
  api.get(`/api/employees/${data?.id}/send_reset_password_link`, {
    cache: {
      ignoreCache: true,
    },
  });

// {employee_id: 1,start_date: "18/10/2023",end_date: "19/12/2023"}
export const getSchedule = async (params, refetch = false) =>
  api.get(`/api/schedules`, {
    cache: {
      ignoreCache: refetch,
    },
    params: params,
  });

export const getScheduleOnly = async (params, refetch = false) =>
  api.get(`/api/appointments`, {
    cache: {
      ignoreCache: refetch,
    },
    params: params,
  });

export const getClientSchedule = async (refetch = false) =>
  api.get(`/api/client/appointments`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getEmployeeServiceLocation = async (
  employee_id,
  refetch = false
) => {
  return await api.get(`api/employees/${employee_id.employee_id}/locations`, {
    cache: {
      ignoreCache: refetch,
    },
  });
};

export const getIntakeFormsWithTreatment = async (id, refetch = false) =>
  api.get(`/api/client/intake_forms?treatment_id=${id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

  export const getClientResponseIntakeForms = async (refetch = false) =>
    api.get(`/api/client/response_intake_forms`, {
      cache: {
        ignoreCache: refetch,
      },
    });

    export const getClientResponseIntakeForm = async (id, refetch = false) =>
      api.get(`/api/client/response_intake_forms/${id}`, {
        cache: {
          ignoreCache: refetch,
        },
      })

export const getSubmittedResponseIntakeForms = async (currentClientId, currentEmployeeId, refetch = false) =>
  api.get(`/api/response_intake_forms?client_id=${currentClientId}&employee_id=${currentEmployeeId}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

  export const getSubmittedResponseIntakeForm = async (id, refetch = false) =>
    api.get(`/api/response_intake_forms/${id}`, {
      cache: {
        ignoreCache: refetch,
      },
    })

export const getChartEntries = async (employeeId, clientId, refetch = false) =>
  api.get(`/api/chart_entries?employee_id=${employeeId}&client_id=${clientId}`, {
    cache: {
      ignoreCache: refetch,
    },
  })

export const getChartEntry = async (id, refetch = false) =>
  api.get(`/api/chart_entries/${id}`, {
    cache: {
      ignoreCache: refetch,
    },
  })

export const loginUser = async (data) => api.post("/api/login", data);
export const signupClient = async (data) =>
  api.post("/api/client/sign_up", data);

export const signInClient = async (data) =>
  api.post("/api/client/log_in", data);

export const requestInventory = async (data) =>
  api.post(`/api/inventory_requests`, data);

export const resetPassword = async (data) =>
  api.post(`/api/employees/reset_password`, data);

export const clientResetPassword = async (data) =>
  api.post(`/api/clients/password_update`, data);

export const createLocation = async (data) => api.post(`/api/locations`, data);

export const createGroupInvoices = async (data) =>
  api.post("/api/invoice_groups", data);

export const invoiceFinalize = async (id, data) =>
  api.post(`/api/invoices/${id}/finalize`, data);

export const multipleInvoiceFinalize = async (data) =>
  api.post(`/api/invoices/finalize_multiple`, data);

export const acceptInventory = async (id, data) =>
  api.post(`/api/inventory_prompts/${id}/accept`, data);

export const rejectInventory = async (id, data) =>
  api.post(`/api/inventory_prompts/${id}/reject`, data);

export const assignInventory = async (data) =>
  api.post(`/api/employee_inventories/transfer`, data);

export const assignInvManagerOrAdminInventory = async (id, data) =>
  api.post(`/api/inventories/${id}/assign`, data);

export const createInventory = async (data) =>
  api.post("/api/inventories", data);

export const rejectInvoice = async (invoiceID, data) =>
  api.post(`/api/invoices/${invoiceID}/send_reject_mail`, data);

export const acceptRequestInventory = async (id) =>
  api.post(`/api/inventory_requests/${id}/accept`);

export const updateVendore = async (id, data) =>
  api.patch(`/api/employees/${id}`, data);

export const rejectRequestInventory = async (id) =>
  api.post(`/api/inventory_requests/${id}/reject`);

export const createProduct = async (data) =>
  api.post(`/api/products/new`, data);

export const createEmployee = async (data) =>
  api.post(`/api/employees/new`, data);

// {email: "client@xyz.com",name: "Test Client", employee_id: 1,}
export const inviteClient = async (data) =>
  api.post(`/api/clients`, {
    client: data,
  });

export const createSchedule = async (data) => api.post(`/api/schedules`, data);
export const createClientSchedule = async (data) =>
  api.post(`/api/client/schedules`, data);

export const createIntakeForm = async (data) =>
  api.post(`/api/intake_forms`, {
    intake_form: data,
  });

export const createQuestionnaire = async (data) =>
  api.post(`/api/questionnaires`, {
    questionnaire: data,
  });

export const updateQuestionnaire = async (id, data) =>
  api.patch(`/api/questionnaires/${id}`, {
    questionnaire: data,
  });

export const createResponseIntakeForm = async (data) =>
  api.post(`api/response_intake_forms`, data);

export const createClient = async (data) =>
  api.post(`/api/clients/?skip_login=true`, data);

export const createChartEntries = async (data) =>
  api.post(`/api/chart_entries`, {chart_entries:data});

export const updateIntakeForm = async (id,data) =>
  api.patch(`/api/intake_forms/${id}`, {
    intake_form: data,
  });



export const updateInvoice = async (invoiceID, data) =>
  api.patch(`/api/invoices/${invoiceID}`, data);

export const updateImages = async (invoiceID, data) =>
  api.put(`/api/invoices/${invoiceID}/update_images`, data);

export const updateInvProduct = async (productId, data) =>
  api.patch(`/api/inventories/${productId}`, data);

export const updateEmployeeInv = async (data) =>
  api.patch(`/api/employees/${data?.employee_id}/update_inventories`, data);

export const updateProduct = async (id, data) =>
  api.patch(`/api/products/${id}`, data);

export const logoutUser = async (data) => api.delete("/api/logout", data);
export const logoutClient = async (data) =>
  api.delete("/api/client/log_out", data);

export const deleteInvProduct = async (id) =>
  api.delete(`/api/inventories/${id}`, {
    cache: {
      ignoreCache: true,
    },
  });

export const deleteEmployeeRoute = async (id) =>
  api.delete(`/api/employees/${id}`, {
    cache: {
      ignoreCache: true,
    },
  });

export const deleteProduct = async (id) =>
  api.delete(`/api/products/${id}`, {
    cache: {
      ignoreCache: true,
    },
  });

export default api;

export const fetchAvailability = async (data, refetch) =>
  api.get(`/api/availabilities`, {
    cache: {
      ignoreCache: refetch,
    },
    params: {
      ...data,
    },
  });

export const deleteEmployeeAvailability = async (id, refetch) =>
  api.delete(`/api/availabilities/${id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const postAvailability = async (data) =>
  api.post(`/api/availabilities`, data);

export const getAvailability = async (data, refetch) =>
  api.get(`/api/unavailabilities`, {
    cache: {
      ignoreCache: refetch,
    },
    params: {
      ...data,
    },
  });



export const markAvailability = async (data) =>
  api.post(`/api/unavailabilities`, data);

export const updateAvailability = async (id, data) =>
  api.put(`/api/unavailabilities/${id}`, data);

export const deleteAppointment = async (id) =>
  api.delete(`/api/client/schedules/${id}`);

export const remainingBalance = async (id) =>
  api.post(`/api/client/schedules/${id}/remaining_pay`);

export const deleteAvailability = async (id) =>
  api.delete(`/api/unavailabilities/${id}`);

export const remainingBalancePaidToEmployee = async (id) =>
  api.post(`/api/schedules/${id}/remaining_paid`);

export const deleteAppointmentEmployee = async (id) =>
  api.delete(`/api/schedules/${id}`);

export const reminder = async (id, data) =>
  api.post(`/api/client/schedules/${id}/reminder`, data);

export const getTreatmentList = async (refetch, id) =>
  api.get(`/api/treatments?employee_id=${id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getTreatmentListOnly = async (refetch, id) =>
  api.get(`/api/schedule_treatments?employee_id=${id}`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getBaseTreatmentList = async (refetch) => {
  let url = `/api/base_treatments`;
  const res = api.get(url, {
    cache: {
      ignoreCache: refetch,
    },
  });

  return res;
}

export const getTreatmentIntakeForm = async (id, refetch) => {
  let url = `/api/treatments/${id}`;
  const res = api.get(url, {
    cache: {
      ignoreCache: refetch,
    },
  });

  return res;
  }

export const createTreatment = async (data, refetch) =>{
let url = `/api/treatments`;
  const res = api.post(url, data, {
    cache: {
      ignoreCache: refetch,
    },
  });

  return res;
}

export const updateTreatment = async (id, data, refetch) => {
  let url = `/api/treatments/${id}`;
  const res = api.put(url, data, {
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}

export const deleteTreatment = async (id, refetch) =>{
  let url = `/api/treatments/${id}`;
  const res = api.delete(url, {
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}


export const GetClientDetails = async (id,refetch) =>{
  let url = `/api/clients/profile?id=${id}`;
  const res = await api.get(url,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}

export const UpdateClient = async (id,refetch,payload) =>{
  let url = `/api/clients/${id}`;
  const res = await api.patch(url, payload,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}
export const CreateClient = async (id,refetch,payload) =>{
  let url = '/api/clients';
  const res = await api.post(url, payload,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}

export const markInvoiceAsPaid = async (id, refetch) => {
  try {
    const url = `/api/invoices/${id}/mark_paid`;
    const res = await api.patch(url, null, {
      cache: {
        ignoreCache: refetch,
      },
    });

    return res.data;
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    throw error;
  }
}

export const createSaveCardCheckoutSession = async (clientStripeId, clientId) => {
  try {
    const url = `/api/client/stripe/create_save_card_checkout_session?customer_id=${clientStripeId}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: clientStripeId,
        client_id: clientId
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export const createCheckoutSession = async (clientId, appointmentId, amount, stripeId) => {
  try {
    const url = `/api/client/stripe/create_checkout_session`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        appointment_id: appointmentId,
        amount: amount,
        stripe_id: stripeId
      }),
    });

    const data = await res.json();    
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export const confirmPayment = async (sessionId, scheduleId) => {
  try {
    const url = `/api/client/stripe/confirm_payment`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        schedule_id: scheduleId
      }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const fetchCreditCards = async (stripeClientId, clientId) => {
  const response = await fetch(`/api/client/stripe/list_attached_cards?customer_id=${stripeClientId}&client_id=${clientId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch credit cards');
  }
  
  return await response.json();
};

export const removeCreditCard = async (paymentMethodId) => {
  const response = await fetch(`/api/client/stripe/remove_card`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentMethodId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error.message || 'Error removing credit card');
  }
};

export  const fetchConfig = async () => {
  try {
    const response = await fetch('/api/config');
    const data = await response.json();

    return data.stripePublicKey;
  } catch (error) {
    console.error('Error fetching config:', error);

    return null;
  }
};
export const AddNoteToAppointment = async (payload,id,refetch) =>{
  let url = '/api/add_note';
  const res = await api.post(url, payload,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}

export const UpdateAppointment = async (payload,id,refetch,) =>{
  let url = `/api/schedules/${payload.appointmentId}`;
  const res = await api.patch(url, payload,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}
export const DeleteAppointmentNote = async (payload,id,refetch) =>{
  let url = `/api/schedules/${payload.schedule_id}/delete_note/${payload.note_id}`;
  const res = await api.delete(url, payload,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}
export const UpdateAppointmentNote = async (payload,id,refetch) =>{
  let url = `/api/schedules/${payload.schedule_id}/update_note/${payload.note_id}`;
  const res = await api.patch(url, payload,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}
export const GetAppointmentDetails = async (payload,refetch) =>{
  let url = `/api/schedules/${payload}`;
  const res = await api.get(url,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}
export const fetchMentors = async () => {
  try {
    const response = await api.get('/api/mentors');
    return response.data.map((mentor) => ({
      value: mentor.id,
      label: mentor.name,
    }));
  } catch (error) {
    console.error('Error fetching mentors:', error);
    throw error;
  }
};

export const fetchBillingPortal = async () => {
  try {
    const response = await api.post("/api/stripe/billing_portal");
    return response.data;
  } catch (error) {
    console.error("Error opening billing portal:", error);
    throw error;
  }
};

export const fetchPricingPlans = async () => {
  try {
    const response = await api.get("/api/stripe/pricing");
    return response.data;
  } catch (error) {
    console.error("Unable to load pricing plans:", error);
    throw error;
  }
};

export const createSubscriptionCheckoutSession = async (priceId) => {
  try {
    const response = await api.post("/api/stripe/checkout", { price_id: priceId });
    return response.data;
  } catch (error) {
    console.error("Unable to initiate checkout:", error);
    throw error;
  }
};

export const subscribeToFreePlan = async (employeeId) => {
  try {
    const response = await api.patch(`/api/employees/${employeeId}/update_plan`, { plan: "free" });
    return response.data;
  } catch (error) {
    console.error("There was an error subscribing to the Free Plan:", error);
    throw error;
  }
};

export const createNewLocation = async (data) =>{
  let url = `/api/locations`;
  const res = await api.post(url,data,{
    cache: {
      ignoreCache: true,
    },
  });
  return res;
}

export const GetLocationDetails = async (locationId,refetch) =>{
  let url = `/api/locations/${locationId}`;
  const res = await api.get(url,{
    cache: {
      ignoreCache: refetch,
    },
  });
  return res;
}
export const UpdateLocation = async (locationId,payload) =>{
  let url = `/api/locations/${locationId}`;
  const res = await api.patch(url,payload,{
    cache: {
      ignoreCache: true,
    },
  });
  return res;
}