import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import "./page.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../modules/constants";
import { SimpleForm } from "../../components/SimpleForm/SimpleForm";
import { useTranslation } from "react-i18next";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = "/v1/auth/signup";
    const payload = { username, email, password };
    try {
      const response = await axios.post(API_URL + endpoint, payload);
      setMessage(response.data.message);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      toast.success(t("user-created-succesfully-please-login"));
      navigate("/login");
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.email ||
          "An error occurred"
      );
    }
  };

  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);

  return (
    <div className="signup-component">
      <SimpleForm>
        <h2 className="simple-form-title">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="simple-form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              name="username"
              className="simple-form-input padding-medium"
              autoComplete="username"
              placeholder="Username"
            />
          </div>
          <div className="simple-form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              name="email"
              className="simple-form-input padding-medium"
              placeholder="Email"
              autoComplete="email"
            />
          </div>
          <div className="simple-form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              name="password"
              className="simple-form-input padding-medium"
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="button w-100 bg-active padding-medium"
          >
            {t("signup")}
          </button>
        </form>
        <button
          onClick={() => navigate("/login")}
          className="button w-100 padding-medium"
        >
          {t("switch-to-login")}
        </button>
      </SimpleForm>
    </div>
  );
}
