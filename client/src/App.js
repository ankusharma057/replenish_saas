import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login";
import AddInvoices from "./components/AddInvoices";
import InvoiceList from "./components/InvoiceList";
import ProductList from "./components/ProductList";
import Signup from "./components/Signup";
import EmployeeList from "./components/EmployeeList";
import Header from "./components/Header";
import Homepage from "./components/Homepage";
import MyProfile from "./components/MyProfile";
import "bootstrap/dist/css/bootstrap.min.css";
import AddProduct from "./components/AddProduct";
import ResetPassword from "./components/ResetPassword";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Inventory from "./components/Inventory";

function App() {
  const [invoiceList, setInvoiceList] = useState();
  const [productList, setProductList] = useState();
  const [searchTerm, setSearch] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [clientsList, setClientsList] = useState();
  const [employeeList, setEmployeeList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/clients").then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setClientsList(data);
        });
      } else {
        navigate("/");
      }
    });
  }, []);

  useEffect(() => {
    fetch(`/api/employees/myprofile`).then((res) => {
      if (res.ok) {
        res.json().then((userProfile) => setUserProfile(userProfile));
      } else {
        navigate("/");
        setUserProfile(null);
      }
    });
  }, []);

  const updateEmployee = (employee) => setUserProfile(employee);

  useEffect(() => {
    fetch("/api/invoices")
      .then((r) => r.json())
      .then((data) => {
        setInvoiceList(data);
      });
  }, [userProfile]);

  useEffect(() => {
    fetch("/api/inventories")
      .then((r) => r.json())
      .then((data) => {
        setInventoryList(data);
      });
  }, [userProfile]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProductList(data);
      });
  }, [userProfile]);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((data) => {
        // console.log({ data });
        setEmployeeList(data);
      });
  }, [userProfile]);

  const addProduct = (newProduct) => {
    const updatedProducts = [...productList, newProduct];
    setProductList(updatedProducts);
  };
  const addInvoice = (newInvoice) => {
    const updatedInvoice = [...invoiceList, newInvoice];
    setInvoiceList(updatedInvoice);
  };

  const onDeleteProduct = (id) => {
    const updatedProductsList = productList?.filter(
      (product) => product.id !== id
    );
    setProductList(updatedProductsList);
  };

  const changeSearch = (value) => {
    setSearch(value);
  };
  const handleProductSave = (updatedProduct) => {
    const updatedProducts = productList.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProductList(updatedProducts);
  };
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login updateEmployee={updateEmployee} />} />
        {userProfile && (
          <>
            {userProfile &&
              (userProfile.is_inv_manager || userProfile.is_admin) && (
                <>
                  <Route
                    path="/inventories"
                    element={
                      <Inventory
                        userProfile={userProfile}
                        employeeList={employeeList}
                        productList={productList}
                        inventoryList={inventoryList}
                      />
                    }
                  />
                  <Route
                    path="/employees"
                    element={
                      <EmployeeList
                        userProfile={userProfile}
                        employeeList={employeeList}
                        productList={productList}
                        inventoryList={inventoryList}
                      />
                    }
                  />
                </>
              )}

            <Route
              path="/resetPassword"
              element={<ResetPassword updateEmployee={updateEmployee} />}
            />

            {userProfile && userProfile.is_admin ? (
              <>
                <Route
                  path="/addproduct"
                  element={
                    <AddProduct
                      addProduct={addProduct}
                      userProfile={userProfile}
                    />
                  }
                />
                <Route
                  path="/employees"
                  element={
                    <EmployeeList
                      userProfile={userProfile}
                      inventoryList={inventoryList}
                    />
                  }
                />
                <Route
                  path="/invoicelist"
                  element={
                    <InvoiceList
                      invoiceList={invoiceList}
                      userProfile={userProfile}
                    />
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProductList
                      onSave={handleProductSave}
                      productList={productList}
                      onDeleteProduct={onDeleteProduct}
                      userProfile={userProfile}
                    />
                  }
                />
                <Route
                  path="/addinvoice"
                  element={
                    <AddInvoices
                      productList={productList}
                      userProfile={userProfile}
                    />
                  }
                />
                <Route
                  path="/signup"
                  element={<Signup userProfile={userProfile} />}
                />
                <Route
                  path="/myprofile"
                  element={
                    <MyProfile
                      employeeList={employeeList}
                      userProfile={userProfile}
                      productList={productList}
                      inventoryList={inventoryList}
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <MyProfile
                      userProfile={userProfile}
                      employeeList={employeeList}
                      productList={productList}
                      inventoryList={inventoryList}
                    />
                  }
                />
              </>
            ) : (
              <>
                <Route
                  path="/myprofile"
                  element={
                    <MyProfile
                      employeeList={employeeList}
                      userProfile={userProfile}
                      productList={productList}
                      inventoryList={inventoryList}
                    />
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProductList
                      onSave={handleProductSave}
                      productList={productList}
                      onDeleteProduct={onDeleteProduct}
                      userProfile={userProfile}
                    />
                  }
                />
                <Route
                  path="/addinvoice"
                  element={
                    <AddInvoices
                      productList={productList}
                      clientsList={clientsList}
                      userProfile={userProfile}
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <MyProfile
                      userProfile={userProfile}
                      productList={productList}
                      inventoryList={inventoryList}
                    />
                  }
                />
              </>
            )}
          </>
        )}
      </Routes>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default App;
