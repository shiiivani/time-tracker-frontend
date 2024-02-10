import React, { useEffect, useState } from "react";
import "../styles/Signin.css";
import logo from "../assets/signin/logo.png";
import mail from "../assets/signin/mail.png";
import lock from "../assets/signin/lock.png";
import view from "../assets/signin/view.png";
import hidden from "../assets/signin/hidden.png";
import { useNavigate } from "react-router-dom";
import note from "../assets/signin/note.png";
import error from "../assets/signin/error.png";
import Axios from "axios";
import preloaderLogo from "../assets/preloader-logo.png";

function Signin() {
  const [isChecked, setChecked] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(false);
  const navigate = useNavigate();
  const [showPreloader, setShowPreloader] = useState(true);

  const handleCheckboxChange = () => {
    setChecked(!isChecked);
  };

  const togglePassword = () => {
    setPasswordHidden(!passwordHidden);
  };

  const signIn = (e) => {
    e.preventDefault();
    Axios.post("https://time-tracker-backend-ho2n.onrender.com/login", {
      email,
      password,
    })
      .then((user) => {
        localStorage.setItem("email", user.data.email);
        if (email === "admin@dhobimate.com" && password === "1234567890") {
          navigate("/time-tracker-frontend/Admin");
        } else if (
          (password === "1234567890" &&
            email === "dhobimate.manipal@gmail.com") ||
          "dhobimate.cvramannagar@gmail.com" ||
          "dhobimate.koramangala@gmail.com"
        ) {
          navigate("/time-tracker-frontend/");
        } else {
          setErr(true);
          setTimeout(() => {
            setErr(false);
          }, 2000);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setShowPreloader(false);
    }, 2000);
    if (localStorage.getItem("email") === "admin@dhobimate.com") {
      navigate("/time-tracker-frontend/Admin");
    } else if (localStorage.getItem("email")) {
      navigate("/time-tracker-frontend/");
    } else if (localStorage.getItem("email") === null) {
      navigate("/time-tracker-frontend/Signin");
    }
    return () => clearTimeout(delayTimeout);
  }, []);

  return (
    <div className="signin">
      {showPreloader && (
        <div
          className={`preloader-wrapper ${showPreloader ? "active" : ""}`}
          id="preloader"
        >
          <img src={preloaderLogo} width="80px" alt="Company logo" />
        </div>
      )}
      <div className="logo">
        <img src={logo} width="180px" />
      </div>
      {err && (
        <div className="alert" style={{ top: err ? "110px" : "-100px" }}>
          <img src={error} width="25px" alt="Error Icon" />
          <p>Username or Password is incorrect. Please try again.</p>
        </div>
      )}
      <div className="note">
        <img src={note} width="300px" alt="A note containing credentials" />
      </div>
      <div className="container">
        <div className="signinContainer">
          <h3>Sign in</h3>
          {/* <p className="error">{err}</p> */}
          <div className="input">
            <img src={mail} width="20px" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input">
            <img src={lock} width="20px" />
            <input
              type={passwordHidden ? "password" : "text"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <img
              className="view"
              src={passwordHidden ? view : hidden}
              width="18px"
              onClick={togglePassword}
            />
          </div>
          <div className="checkbox">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <p>Remember me</p>
          </div>
          <div className="button" onClick={signIn}>
            <p>SIGN IN</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
