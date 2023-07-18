import React, { useDebugValue, useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

function Login({ updateEmployee, userProfile }) {
  const loginState = {
    email: "",
    password: "",
  };
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState(loginState);
  const location = useLocation();

  // console.log({ location });
  const navigate = useNavigate();
  useEffect(() => {
    if (userProfile && location.pathname === "/") {
      return navigate("/myprofile");
    }
    return () => {};
  }, [navigate, userProfile]);
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }).then((res) => {
      if (res.ok) {
        res.json().then((user) => {
          updateEmployee(user);
          toast.success("Successfully Logged In");
          navigate("/myprofile");
        });
      } else if (res.status == 302) {
        res.json().then((user) => {
          navigate("/resetPassword");
        });
      } else {
        res.json().then((json) => setErrors(json.errors));
        toast.error("Failed to Log In");
        setFormData(loginState);
      }
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const loginForm = (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control
          name="email"
          type="text"
          required
          value={formData.email}
          placeholder="Enter your email"
          onChange={handleChange}
        />
      </Form.Group>
      <br />
      <Form.Group>
        <Form.Label>Password</Form.Label>
        <Form.Control
          name="password"
          type="password"
          required
          value={formData.password}
          placeholder="Enter password"
          onChange={handleChange}
        />
      </Form.Group>
      <br />
      <Form.Group>
        <Button type="submit">Login</Button>
      </Form.Group>
    </Form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to ReplenishMD
          </h2>
          {loginForm}
        </div>
      </div>
    </div>
  );
}

export default Login;
