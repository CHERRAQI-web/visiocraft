import Layout from './components/layout.jsx';
import Dashboard from './pages/dashboard.jsx'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ProjectDetails from './pages/projectDetails.jsx'
function App() {

  return (
    <>
    <Router>
        <Routes>
          {/* Routes avec Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects/project/:id" element={<ProjectDetails />} />
          </Route>

        </Routes>
      </Router>
    </>
  )
}

export default App
