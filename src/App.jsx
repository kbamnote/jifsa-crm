import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/pages/dashboard/Dashboard";
import JIFSA from "./components/pages/JIFSA/Jifsa";
import EliteBim from "./components/pages/EliteBIM/EliteBim";
import Layout from "./components/common/Layout";
import PaymentDetail from "./components/pages/paymentDetail/PaymentDetail";
import Team from "./components/pages/team/Team";
import LeadAssigned from "./components/pages/team/LeadAssigned";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jifsa" element={<JIFSA />} />
          <Route path="/bim" element={<EliteBim />} />
          <Route path="/payment-detail" element={<PaymentDetail/>}/>
          <Route path="/team" element={<Team/>}/>
          <Route path="/lead-assigned" element={<LeadAssigned/>}/>
        </Route>
      </Routes>
    </>
  );
}

export default App;