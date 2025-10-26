import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Home from "./pages/home.jsx";
import Footer from './components/footer.jsx';
import Layout from "./components/layout.jsx";
 import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Contact from './pages/contact.jsx';
import { CookiesProvider } from "react-cookie";

function App() {
  return (
    <> <CookiesProvider>
        <Router>
            
          <Routes>
          <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="contact" element={<Contact />} />

          </Route>
        </Routes>
      </Router> </CookiesProvider>
    </>
  )
}

export default App
