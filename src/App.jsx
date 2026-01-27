import { Routes, Route } from "react-router-dom";
import Login from "./components/auth/Login";
import Dashboard from "./components/pages/dashboard/Dashboard";
import JIFSA from "./components/pages/dashboard/products/JIFSA/Jifsa";
import EliteBim from "./components/pages/dashboard/products/EliteBIM/EliteBim";
import Layout from "./components/common/Layout";
import PaymentDetail from "./components/pages/paymentDetail/PaymentDetail";
import Team from "./components/pages/teamAndLeadAssign/Team";
import TeamDetails from "./components/pages/teamAndLeadAssign/TeamDetails";
import LeadAssigned from "./components/pages/teamAndLeadAssign/LeadAssigned";
import LeadManagement from "./components/pages/teamAndLeadAssign/LeadManagement";
import ViewLead from "./components/pages/teamAndLeadAssign/ViewLead";
import B2B from "./components/pages/b2b/B2B";
import Mail from "./components/pages/mail/Mail";
import MailTracking from "./components/pages/mail/MailTracking";
import ImgAndFiles from "./components/pages/image&files/ImgAndFiles";
import SocialMedia from "./components/pages/socialMedia/SocialMedia"; 
import EEETechnologies from './components/pages/dashboard/products/eeeTechnologies/EEETechnologies';
import ViewEnrollment from './components/pages/dashboard/products/eeeTechnologies/ViewEnrollment';
import JobImportPage from './components/pages/companyImport/JobImportPage';
import JobManagement from './components/pages/companyImport/JobManagement';
import ViewJob from './components/pages/companyImport/ViewJob';
import ReportPage from './components/pages/reports/ReportPage';
import InternAppliedDataPage from './components/pages/internAppliedData/InternAppliedDataPage';
import InternApplicationDetailView from './components/pages/internAppliedData/InternApplicationDetailView';
import Seo from "./components/pages/seo-and-blogs/Seo";
import Blog from "./components/pages/seo-and-blogs/Blog";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jifsa" element={<JIFSA />} />
          <Route path="/bim" element={<EliteBim />} />
          <Route path="/eee" element={<EEETechnologies/>}/>
          <Route path="/enrollment/:id" element={<ViewEnrollment/>}/>
          <Route path="/billing-details" element={<PaymentDetail/>}/>
          <Route path="/team" element={<Team/>}/>
          <Route path="/team/:id" element={<TeamDetails/>}/>
          <Route path="/lead-assigned" element={<LeadAssigned/>}/>
          <Route path="/lead-management" element={<LeadManagement/>}/>
          <Route path="/lead/:id" element={<ViewLead/>}/>
          <Route path="/b2b" element={<B2B/>}/>
          <Route path="/mail" element={<Mail/>}/>
          <Route path="/mail-track" element={<MailTracking/>}/>
          <Route path="/img-files" element={<ImgAndFiles/>}/>
          <Route path="/social-media" element={<SocialMedia/>}/> 
          <Route path="/intern-applied-data" element={<InternAppliedDataPage/>}/>
          <Route path="/intern-application/:id" element={<InternApplicationDetailView/>}/>
          <Route path="/company-import" element={<JobImportPage/>}/>
          <Route path="/job-management" element={<JobManagement/>}/>
          <Route path="/job/:id" element={<ViewJob/>}/>
          <Route path="/reports" element={<ReportPage/>}/>
          <Route path="/seo" element={<Seo/>}/>
          <Route path="/blog" element={<Blog/>}/>
        </Route>
      </Routes>
    </>
  );
}

export default App;