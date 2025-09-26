import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/pages/Dashboard";
import Admission from "./components/pages/Admission";
import Complaint from "./components/pages/Complaint";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/admission" element={<Admission/>} />
            <Route path="/complaint" element={<Complaint/>} />
      </Routes>
    </>
  );
}

export default App;
