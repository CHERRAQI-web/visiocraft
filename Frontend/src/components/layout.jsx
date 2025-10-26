import { Outlet } from "react-router-dom"; // Importer Outlet

import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";

const Layout = () => {


  // Afficher le layout avec la navbar et l'outlet pour les routes enfants
  return (
    <div>
     
     
          <Navbar />
      
      <main>
        {/* L'Outlet ici rendra les composants enfants */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
