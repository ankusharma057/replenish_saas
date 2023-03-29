import { useState, useEffect } from "react";
import { BrowserRouter, Switch , Route, Routes } from "react-router-dom";
import Login from './components/Login';
import AddInvoice from './components/AddInvoice';
import InvoiceList from './components/InvoiceList';
import ProductList from './components/ProductList';
import Signup from './components/Signup';
import EmployeeList from './components/EmployeeList'
import Navbar from "./components/Header";
import Homepage from "./components/Homepage"
import MyProfile from "./components/MyProfile";
import 'bootstrap/dist/css/bootstrap.min.css';
import AddProduct from "./components/AddProduct";



function App() {
  const [employeeList, setEmployeeList] = useState();
  const [invoiceList, setInvoiceList] = useState();
  const [productList, setProductList] = useState();
  const [searchTerm, setSearch] = useState("")
  const [employee, setEmployee] = useState(null)

  // useEffect(()=> {
  //   fetch('/authorized')
  //   .then(res =>{
  //     if(res.ok){
  //       res.json().then(employee => setEmployee(employee))
  //     } else{
  //       setEmployee(null)
  //     }
  //   })
  // },[])

  useEffect(()=> {
    fetch("/employees")
    .then(r => r.json())
    .then(data => {
      setEmployeeList(data)
    })
  }, [])

  
  useEffect(()=> {
    fetch("/invoices")
    .then(r => r.json())
    .then(data => {
      setInvoiceList(data)
    })
  }, [])

  const [errors, setErrors] = useState(null)

  useEffect(() => {
    fetch("/myprofile").then((res) => {
      if (res.ok) {
        res.json().then((user) => setEmployee(employee));
      } else {
        setEmployee(null)
      }
    });
  }, []);

  const updateEmployee = (employee) => setEmployee(employee)

  useEffect(()=> {
    fetch("/products")
    .then(r => r.json())
    .then(data => {
      setProductList(data)
    })
  }, [])

  const addProduct = (newProduct) => {
    const updatedProducts = [...productList, newProduct];
    setProductList(updatedProducts)
  }
  const addInvoice = (newInvoice) => {
    const updatedInvoice = [...invoiceList, newInvoice];
    setInvoiceList(updatedInvoice)
  }

  const onDeleteProduct = (id) => {
    const updatedProductsList = productList.filter((product) => product.id !== id)
    setProductList(updatedProductsList)
  }

  const changeSearch = (value) => {
    setSearch(value)
  }

  // const filteredProducts = productList.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
console.log(employeeList)


  return (
 <div>
  <BrowserRouter>
    <Routes>
      <Route path='/'
      element={<Login updateEmployee={updateEmployee}/>}/>
       <Route path='/addproduct'
      element={<AddProduct addProduct={addProduct}/>}/>
      <Route path='/employees'
      element={<EmployeeList employeeList={employeeList} invoiceList={invoiceList}/>}/>
      <Route path='/invoicelist'
      element={<InvoiceList invoiceList={invoiceList}/>}/>
      <Route path='/products'
      element={<ProductList productList={productList}
      onDeleteProduct={onDeleteProduct}
      searchTerm={searchTerm}
      changeSearch={changeSearch}/>}/>
      <Route path='/addinvoice'
      element={<AddInvoice addInvoice={addInvoice} />}/>
      <Route path='/signup'
      element={<Signup/>}/>
       <Route path='/myprofile'
      element={<MyProfile />}/>
      
    </Routes>
  </BrowserRouter>
 </div>
  );
}

export default App;