import Layout from './components/layout.jsx';
import Dashboard from './pages/dashboard.jsx';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Freelancer from './pages/freelancers.jsx';
import Client from './pages/client.jsx';
import FreelancerDetails from './pages/freelancerDetails.jsx';
import Project from './pages/projects.jsx';
import ProjectDetails from './pages/projectsDetails.jsx';
function App() {

  return (
    <>
    <Router>
        <Routes>
          {/* Routes avec Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='Freelancer' element={<Freelancer />} />
            <Route path='Client' element={<Client />} />
            <Route path='Freelancer/:freelancerId?' element={<FreelancerDetails />} />
             <Route path='projects' element={<Project />} />
            <Route path='projects/:projectId' element={<ProjectDetails />} />

          </Route>

        </Routes>
      </Router>
    </>
  )
}

export default App
