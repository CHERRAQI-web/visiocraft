import Layout from './components/layout.jsx';
import Dashboard from './pages/dashboard.jsx';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Project from './pages/project.jsx';
import Form_project from './pages/form_project.jsx';
import { MantineProvider } from "@mantine/core";
import ProjectEdit from './pages/editProject.jsx';
import ProjectDetails   from './pages/projectDetails.jsx';
function App() {
  return (
    <MantineProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Project />} />
            <Route path="Form_project" element={<Form_project />} />
            <Route path="/projects/:id/edit" element={<ProjectEdit />}/>
            <Route path='projects/:projectId' element={<ProjectDetails />} />
          </Route>
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
