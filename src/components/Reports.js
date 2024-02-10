import React, { useEffect, useState } from "react";
import report from "../assets/sidebar/report.png";
import home from "../assets/sidebar/home.png";
import clock from "../assets/homepage/clock.png";
import { useNavigate } from "react-router-dom";
import "../styles/Reports.css";
import Axios from "axios";

function Reports() {
  const navigate = useNavigate();
  const [logData, setLogData] = useState([]);
  const [store, setStore] = useState("");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("02");

  const handleYears = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleMonths = (event) => {
    setSelectedMonth(event.target.value);
  };

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const response = await Axios.get(
          "https://time-tracker-backend-ho2n.onrender.com/getFilteredData",
          {
            params: {
              email: localStorage.getItem("email"),
              month: selectedMonth,
              year: selectedYear,
            },
          }
        );
        setLogData(response.data[0].loginLogoutTimes);
        console.log("Data fetched successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchFilteredData();
  }, [selectedMonth, selectedYear]);

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const formatDuration = (durationMs) => {
    // Convert milliseconds to hours and minutes
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.round((durationMs % (1000 * 60 * 60)) / (1000 * 60)); // Round the minutes

    // Format hours and minutes into HH:MM format
    const formattedHours = String(hours).padStart(2, "0");

    return `${hours} h `;
  };

  const calculateDuration = (loginTime, logoutTime) => {
    const startTime = Date.parse(loginTime);
    const endTime = Date.parse(logoutTime);

    const durationInMilliseconds = endTime - startTime;
    return formatDuration(durationInMilliseconds);
  };

  return (
    <div className="reports">
      <div className="sidebar">
        <h2>STORE TIME TRACKER</h2>
        <img className="clock" src={clock} width="35px" />
        <div
          className="options"
          onClick={() => navigate("/time-tracker-frontend/")}
        >
          <img src={home} width="25px" />
          <p>Home</p>
        </div>
        <div className="options report">
          <img src={report} width="25px" />
          <p>Report</p>
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
        {logData.map((logEntry, index) => (
          <div className="tableBody" key={index}>
            <>
              <p className="date">{logEntry.date}</p>
              <p className="logInTime" style={{ marginRight: "35px" }}>
                {formatTime(logEntry.loginTime)}
              </p>
              <p className="logOutTime" style={{ marginRight: "40px" }}>
                {formatTime(logEntry.logoutTime)}
              </p>
              <p className="duration" style={{ marginRight: "7px" }}>
                {calculateDuration(logEntry.loginTime, logEntry.logoutTime)}
              </p>
            </>
            <div className="border"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reports;
