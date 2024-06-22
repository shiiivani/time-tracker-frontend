import React, { useEffect, useState } from "react";
import "../styles/Admin.css";
import bucket from "../assets/admin/bucket.png";
import home from "../assets/sidebar/home.png";
import clock from "../assets/homepage/clock.png";
import laundry from "../assets/admin/laundry.png";
import { useNavigate } from "react-router-dom";
import logo from "../assets/homepage/logo.png";
import preloaderLogo from "../assets/preloader-logo.png";
import Axios from "axios";

function Admin() {
  const navigate = useNavigate();
  const [logData, setLogData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("02");
  const [selectedStore, setSelectedStore] = useState("Dhobimate Manipal");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("month");
  const [averageDuration, setAverageDuration] = useState();
  const [logout, setLogout] = useState(false);
  const [logInTime, setLogInTime] = useState("");
  const [logOutTime, setLogOutTime] = useState("");
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    const currentDate = new Date().toLocaleDateString("en-US", options);
    // return currentDate;
    setCurrentDate(currentDate);
    getGreetingMessage();
    if (localStorage.getItem("email") === "undefined") {
      navigate("/Admin");
    } else if (
      localStorage.getItem("email") === "dhobimate.manipal@gmail.com"
    ) {
      navigate("/");
    } else if (localStorage.getItem("email") === null) {
      navigate("/Signin");
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

  const fetchData = async () => {
    try {
      const response = await Axios.get(
        "https://time-tracker-backend-ho2n.onrender.com/getDataStorewise",
        {
          params: {
            store: selectedStore,
            month: selectedMonth,
            year: selectedYear,
          },
        }
      );
      setLogData(response.data[0].loginLogoutTimes);
      calculateAverageDurationForMonth(response.data[0].loginLogoutTimes);
    } catch (error) {
      if (error) {
        setLogData([]);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStore, selectedMonth, selectedYear]);

  const calculate = (loginTime, logoutTime) => {
    const login = new Date(loginTime);
    const logout = new Date(logoutTime);
    return (logout - login) / (1000 * 60); // Duration in minutes
  };

  const calculateAverageDurationForMonth = (data) => {
    let totalDuration = 0;
    data.forEach((entry) => {
      const duration = calculate(entry.loginTime, entry.logoutTime);
      totalDuration += duration;
    });
    const avgDurationInMinutes = data.length ? totalDuration / data.length : 0;
    const avgDurationInHrs = Math.round(avgDurationInMinutes / 60);

    setAverageDuration(`${avgDurationInHrs} h`);
  };

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const formatDuration = (durationMs) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    const formattedHours = String(hours).padStart(2, "0");

    return `${hours} h `;
  };

  const calculateDuration = (loginTime, logoutTime) => {
    const startTime = Date.parse(loginTime);
    const endTime = Date.parse(logoutTime);

    const durationInMilliseconds = endTime - startTime;
    return formatDuration(durationInMilliseconds);
  };

  const handleYears = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleMonths = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleStores = (event) => {
    setSelectedStore(event.target.value);
  };

  const handleFilter = (event) => {
    setSelectedFilter(event.target.value);
  };

  const logOut = () => {
    navigate("/Signin");
    localStorage.clear();
  };

  const handleTimeChange = (field, value) => {
    if (field === "logInTime") {
      setLogInTime(value);
    } else if (field === "logOutTime") {
      setLogOutTime(value);
    }
  };

  const updateTimesWithNewTime = (
    entry,
    updatedLoginTime,
    updatedLogoutTime
  ) => {
    const [day, month, year] = entry.date.split("/");
    const existingDate = new Date(`${year}-${month}-${day}`);

    const [loginHours, loginMinutes] = updatedLoginTime.split(":").map(Number);
    // const [logoutHours, logoutMinutes] = updatedLogoutTime
    //   .split(":")
    //   .map(Number);

    const updatedLoginDate = new Date(
      existingDate.getFullYear(),
      existingDate.getMonth(),
      existingDate.getDate(),
      loginHours,
      loginMinutes
    );

    let updatedLogoutDate = null;

    if (updatedLogoutTime) {
      const [logoutHours, logoutMinutes] = updatedLogoutTime
        .split(":")
        .map(Number);
      updatedLogoutDate = new Date(
        existingDate.getFullYear(),
        existingDate.getMonth(),
        existingDate.getDate(),
        logoutHours,
        logoutMinutes
      );
    }

    const updatedEntry = {
      loginTime: updatedLoginDate,
      logoutTime: updatedLogoutDate,
    };

    return updatedEntry;
  };

  const handleSave = async (logEntry) => {
    const updatedEntry = updateTimesWithNewTime(
      logEntry,
      logInTime,
      logOutTime
    );
    try {
      await Axios.put(
        `https://time-tracker-backend-ho2n.onrender.com/updateTime`,
        {
          store: selectedStore,
          date: logEntry.date,
          updatedEntry,
        }
      );
      fetchData();
    } catch (error) {}
    setLogInTime("");
    setLogOutTime("");
  };

  useEffect(() => {
    const delayTimeout = setTimeout(() => {
      setShowPreloader(false);
    }, 2000);

    return () => clearTimeout(delayTimeout);
  }, []);

  return (
    <div className="admin">
      {showPreloader && (
        <div
          className={`preloader-wrapper ${showPreloader ? "active" : ""}`}
          id="preloader"
        >
          <img src={preloaderLogo} width="80px" alt="Company logo" />
        </div>
      )}
      <div className="sidebar">
        <h2>ADMIN</h2>
        <img className="clock" src={clock} width="35px" />
        <div className="options home">
          <img src={home} width="25px" />
          <p>Home</p>
        </div>
      </div>
      <div className="storeSelection">
        <select value={selectedStore} onChange={handleStores}>
          <option value="Dhobimate Manipal">Dhobimate Manipal</option>
          <option value="Dhobimate CV Raman Nagar">
            Dhobimate CV Raman Nagar
          </option>
          <option value="Dhobimate Koramangala">Dhobimate Koramangala</option>
        </select>
        <div className="logOut" onClick={() => setLogout(!logout)}>
          <img src={logo} width="50px" />
          <p className={logout ? "view" : "hidden"} onClick={logOut}>
            Log out
          </p>
        </div>
      </div>
      <div className="rightside">
        <div className="firstContainer">
          {/* <select value={selectedFilter} onChange={handleFilter}>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select> */}
          <img src={bucket} width="50px" />
          <h6>AVERAGE MONTHLY HOURS</h6>
          <p>{averageDuration}</p>
        </div>
        <div className="secondContainer">
          <div className="content">
            <h1>{greetingMessage}</h1>
            <p>
              Welcome, Admin! It's great to see you. Your command center is
              ready for action. Manage with ease and make things happen. Happy
              administering!
            </p>
            <p className="date">{currentDate}</p>
          </div>
          <div className="laundryImage">
            <img src={laundry} width="250px" />
          </div>
        </div>
      </div>
      <div className="table">
        <div className="tableHead">
          <h3>Monthly Report</h3>
          <div className="filters">
            <select value={selectedYear} onChange={handleYears}>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
            <select value={selectedMonth} onChange={handleMonths}>
              <option value="01">Jan</option>
              <option value="02">Feb</option>
              <option value="03">Mar</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">Jun</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
          </div>
        </div>
        <div className="tableSubHead">
          <h6>DATE</h6>
          <h6 className="loginHeader">LOGIN</h6>
          <h6 className="logoutHeader">LOGOUT</h6>
          <h6>DURATION</h6>
        </div>
        {logData.map((logEntry) => {
          return (
            <>
              <div className="tableBody" key={logEntry.date}>
                <p className="date">{logEntry.date}</p>
                <input
                  type="time"
                  value={formatTime(logEntry.loginTime)}
                  className="logInTime"
                  style={{ marginRight: "35px" }}
                  onChange={(e) =>
                    handleTimeChange("logInTime", e.target.value)
                  }
                />

                <input
                  type="time"
                  value={formatTime(logEntry.logoutTime)}
                  className="logOutTime"
                  style={{ marginRight: "40px" }}
                  onChange={(e) =>
                    handleTimeChange("logOutTime", e.target.value)
                  }
                />

                <p className="duration" style={{ marginRight: "7px" }}>
                  {calculateDuration(logEntry.loginTime, logEntry.logoutTime)}
                </p>
                <button className="edit" onClick={() => handleSave(logEntry)}>
                  Save
                </button>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
}

export default Admin;
