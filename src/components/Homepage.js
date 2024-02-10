import React, { useEffect, useState } from "react";
import "../styles/Homepage.css";
import logo from "../assets/homepage/logo.png";
import washingMachine from "../assets/homepage/washing-machine.png";
import home from "../assets/sidebar/home.png";
import report from "../assets/sidebar/report.png";
import clock from "../assets/homepage/clock.png";
import preloaderLogo from "../assets/preloader-logo.png";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import error from "../assets/signin/error.png";

function Homepage() {
  const [activeLogout, setActivelogout] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState([]);
  const [checkin, setCheckin] = useState("--");
  const [checkout, setCheckout] = useState("--");
  const [duration, setDuration] = useState("--");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [showPreloader, setShowPreloader] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    const currentDate = new Date().toLocaleDateString("en-US", options);
    setCurrentDate(currentDate);
    getGreetingMessage();
    if (localStorage.getItem("email") === "undefined") {
      navigate("/time-tracker-frontend/Admin");
    } else if (
      localStorage.getItem("email") === "dhobimate.manipal@gmail.com"
    ) {
      navigate("/time-tracker-frontend/");
    } else if (localStorage.getItem("email") === null) {
      navigate("/time-tracker-frontend/Signin");
    }
  }, []);

  const getGreetingMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      setGreetingMessage("Good Morning!");
    } else if (currentHour >= 12 && currentHour < 17) {
      setGreetingMessage("Good Afternoon!");
    } else {
      setGreetingMessage("Good Evening!");
    }
  };

  const logOut = () => {
    navigate("/time-tracker-frontend/Signin");
    localStorage.clear();
  };

  useEffect(() => {
    const userEmail = localStorage.getItem("email");
    const config = {
      headers: {
        Authorization: userEmail,
      },
    };
    Axios.get("https://time-tracker-backend-ho2n.onrender.com/getUser", config)
      .then((response) => {
        const userData = response.data;
        setUserInfo([userData]);
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
      });
  }, []);

  const Checkin = async () => {
    try {
      const email = localStorage.getItem("email");
      const loginTimeData = { email: email };
      const response = await Axios.post(
        "https://time-tracker-backend-ho2n.onrender.com/checkIn",
        loginTimeData
      );
    } catch (error) {
      if (error.response.data === "Already checked in for today.") {
        setErr(true);
        setTimeout(() => {
          setErr(false);
        }, 2000);
      }
    }
    fetchTime();
  };

  const Checkout = async () => {
    try {
      const email = localStorage.getItem("email");

      const response = await Axios.post(
        "https://time-tracker-backend-ho2n.onrender.com/checkOut",
        {
          email: email,
        }
      );
    } catch (error) {
      console.error("Error checking out:", error);
    }
    fetchTime();
  };

  const formatTime = (timing) => {
    const timestamp = new Date(timing);
    const hours = timestamp.getHours().toString().padStart(2, "0");
    const minutes = timestamp.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;
    return time;
  };

  const fetchTime = async () => {
    try {
      const email = localStorage.getItem("email");
      const response = await Axios.get(
        "https://time-tracker-backend-ho2n.onrender.com/getCurrentData",
        {
          params: { email },
        }
      );
      const loginTime = response.data.loginTime;
      const logoutTime = response.data.logoutTime;
      const duration = calculateDuration(loginTime, logoutTime);
      setCheckin(formatTime(loginTime));
      if (logoutTime === null) {
        setCheckout("--");
        setDuration("--");
      } else {
        setCheckout(formatTime(logoutTime));
        setDuration(duration);
      }
    } catch (error) {
      console.error("Error fetching the data:", error);
    }
  };

  useEffect(() => {
    fetchTime();
  }, []);

  const formatDuration = (durationMs) => {
    // Convert milliseconds to hours and minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    // Format hours and minutes into HH:MM format
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return `${hours} h`;
  };

  const calculateDuration = (loginTime, logoutTime) => {
    const startTime = Date.parse(loginTime);
    const endTime = Date.parse(logoutTime);

    const durationInMilliseconds = endTime - startTime;
    return formatDuration(durationInMilliseconds);
  };

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setShowPreloader(false);
    }, 2000);

    return () => clearTimeout(delayTimeout);
  }, []);

  return (
    <div className="homepage">
      {showPreloader && (
        <div
          className={`preloader-wrapper ${showPreloader ? "active" : ""}`}
          id="preloader"
        >
          <img src={preloaderLogo} width="80px" alt="Company logo" />
        </div>
      )}
      <div className="sidebar">
        <h2>STORE TIME TRACKER</h2>
        <img className="clock" src={clock} width="35px" />
        <div className="options home">
          <img src={home} width="25px" />
          <p>Home</p>
        </div>
        <div
          className="options"
          onClick={() => navigate("/time-tracker-frontend/Reports")}
        >
          <img src={report} width="25px" />
          <p>Report</p>
        </div>
      </div>{" "}
      <div className="rightside">
        {userInfo.map((user) => {
          return (
            <>
              <h5 key={user.email}>{user.name}</h5>
              <img
                className="logo"
                src={user.logo}
                width="45px"
                onClick={() => {
                  setActivelogout(!activeLogout);
                }}
              />
            </>
          );
        })}
      </div>
      <div
        className={activeLogout ? "logout active" : "logout notActive"}
        onClick={logOut}
      >
        <p>Log out</p>
      </div>
      <div className="upper">
        {userInfo.map((user) => {
          return (
            <div className="upperLeft" key={user.name}>
              <div className="logoContainer">
                <div className="logo">
                  <img src={user.logo} width="150px" />
                </div>
                <p className="email">{user.email}</p>
              </div>
              <div className="detailContainer">
                <p className="heading">Address</p>
                <p className="detail">{user.address}</p>
                <p className="heading">Contact</p>
                <p className="detail">+91 {user.phoneNumber} </p>
              </div>
            </div>
          );
        })}
        {err && (
          <div className="alert" style={{ top: err ? "30px" : "-100px" }}>
            <img src={error} width="25px" alt="Error Icon" />
            <p>User already checked in.</p>
          </div>
        )}
        <div className="upperRight">
          <div className="welcome">
            <div className="message">
              <h3 className="welcomeMessage">{greetingMessage}</h3>
              <p>
                Your dedication and hard work contribute to our success. Please
                log in and out with ease, and let us know if there's anything we
                can do to enhance your experience.
              </p>
              <h3 className="date">{currentDate}</h3>
            </div>
            <div className="image">
              <img src={washingMachine} width="290px" />
            </div>
          </div>
          <div className="middle">
            <div className="logoContainer">
              <div className="logo">
                <img src={logo} width="150px" />
              </div>
              <p className="email">dhobimate.manipal@gmail.com</p>
            </div>
            <div className="detailContainer">
              <p className="heading">Address</p>
              <p className="detail">
                Student Plaza, Eshwar Nagar, Manipal, Karnataka 576104
              </p>
              <p className="heading">Contact</p>
              <p className="detail">+91 9936514256 </p>
            </div>
          </div>
          <div className="tracker">
            <h3>Today's working hours</h3>
            <div className="containers">
              <div className="login">
                <p className="headings">LOGIN</p>
                <p
                  className="times"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {checkin}
                </p>
              </div>
              <div className="log-out">
                <p className="headings">LOGOUT</p>
                <p
                  className="times"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {checkout}
                </p>
              </div>
              <div className="duration">
                <p className="headings">TOTAL DURATION</p>
                <p
                  className="times"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {duration}
                </p>
              </div>
            </div>
            <div className="buttons">
              <div className="button" onClick={Checkin}>
                Check in
              </div>
              <div className="button" onClick={Checkout}>
                Check out
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
