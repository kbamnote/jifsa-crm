import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/pages/dashboard/Dashboard";
import JIFSA from "./components/pages/dashboard/products/JIFSA/Jifsa";
import EliteBim from "./components/pages/dashboard/products/EliteBIM/EliteBim";
import Layout from "./components/common/Layout";
import PaymentDetail from "./components/pages/paymentDetail/PaymentDetail";
import Team from "./components/pages/teamAndLeadAssign/Team";
import LeadAssigned from "./components/pages/teamAndLeadAssign/LeadAssigned";
import B2B from "./components/pages/b2b/B2B";
import Mail from "./components/pages/mail/Mail";
import MailTracking from "./components/pages/mail/MailTracking";
import ImgAndFiles from "./components/pages/image&files/ImgAndFiles";
import SocialMedia from "./components/pages/socialMedia/SocialMedia"; // Add this import

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jifsa" element={<JIFSA />} />
          <Route path="/bim" element={<EliteBim />} />
          <Route path="/billing-details" element={<PaymentDetail/>}/>
          <Route path="/team" element={<Team/>}/>
          <Route path="/lead-assigned" element={<LeadAssigned/>}/>
          <Route path="/b2b" element={<B2B/>}/>
          <Route path="/mail" element={<Mail/>}/>
          <Route path="/mail-track" element={<MailTracking/>}/>
          <Route path="/img-files" element={<ImgAndFiles/>}/>
          <Route path="/social-media" element={<SocialMedia/>}/> {/* Add this route */}
        </Route>
      </Routes>
    </>
  );
}

export default App;