import axios from "axios";
import { setupCache } from "axios-cache-adapter";

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

export const getUpdatedUserProfile = async (refetch) =>
  api.get("/api/employees/myprofile", {
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

export const getInventoryList = async (refetch) =>
  api.get("/api/inventories", {
    cache: {
      ignoreCache: refetch,
    },
  });

export const getInvoiceList = async (refetch) =>
  api.get("/api/invoices", {
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

export const getEmployeesList = async (refetch = false) =>
  api.get("/api/employees", {
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

export const getLocationEmployee = async (locationId, refetch = false) =>
  api.get(`api/locations/${locationId}/employees`, {
    cache: {
      ignoreCache: refetch,
    },
  });

export const downloadInvoice = async (invoiceID) =>
  api.get(`/api/invoices/${invoiceID}/download_attachment`, {
    responseType: "blob",
  });

export const getRequestInventory = async (refetch) =>
  api.get(`/api/inventory_requests`, {
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

export const loginUser = async (data) => api.post("/api/login", data);

export const requestInventory = async (data) =>
  api.post(`/api/inventory_requests`, data);

export const resetPassword = async (data) =>
  api.post(`/api/employees/reset_password`, data);

export const asignContributor = async (data) =>
  api.post("/asignContributor", data);

export const changeContributor = async (data) =>
  api.post("/changecontributor", data);

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

export const updateInvoice = async (invoiceID, data) =>
  api.patch(`/api/invoices/${invoiceID}`, data);

export const updateInvProduct = async (productId, data) =>
  api.patch(`/api/inventories/${productId}`, data);

export const updateEmployeeInv = async (data) =>
  api.patch(`/api/employees/${data?.employee_id}/update_inventories`, data);

export const updateProduct = async (id, data) =>
  api.patch(`/api/products/${id}`, data);

export const logoutUser = async (data) => api.delete("/api/logout", data);

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
