import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Homepage from "./components/Homepage";
import Signin from "./components/Signin";
import Reports from "./components/Reports";
import Admin from "./components/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Admin" element={<Admin />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/Signin" element={<Signin />} />
        <Route path="/Reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
