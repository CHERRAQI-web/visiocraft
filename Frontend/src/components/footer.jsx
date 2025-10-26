import React from "react";
import { Link } from "react-router-dom";
import { IconBrandFacebook, IconBrandLinkedin, IconBrandX, IconMail, IconPhone, IconChevronRight } from "@tabler/icons-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        // Changement de bg-gray-900 à bg-gray-50/bg-white pour le mode clair
        <footer className="bg-sky-600 text-gray-900 border-t border-gray-200 ">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                {/* Section du contenu principal */}
                {/* La bordure est maintenant en gray-300 pour rester visible sur le fond clair */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 border-b border-gray-300 pb-10">

                    {/* Colonne 1: Logo & Description */}
                    <div className="col-span-2">
                        {/* LOGO: Identique au Navbar pour la cohérence */}
                        <h3 className="text-2xl font-extrabold text-white tracking-wider mb-4">
                            Visio<span className="text-teal-200">Craft</span>
                        </h3>
                        <p className="text-white text-sm max-w-xs">
                            Accédez à l'élite des freelances créatifs et techniques. Nous transformons votre vision en succès numérique durable.
                        </p>
                        
                        {/* Liens Réseaux Sociaux (Icônes en Gris, Hover en Violet) */}
                        <div className="mt-6 flex space-x-5">
                            <a href="#" aria-label="Facebook" className="text-white hover:text-teal-200 transition">
                                <IconBrandFacebook size={24} />
                            </a>
                            <a href="#" aria-label="LinkedIn" className="text-white hover:text-teal-200 transition">
                                <IconBrandLinkedin size={24} />
                            </a>
                            <a href="#" aria-label="X (Twitter)" className="text-white hover:text-teal-200 transition">
                                <IconBrandX size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Colonne 2: Naviguer */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-5">Naviguer</h3>
                        <ul className="space-y-3">
                            {/* Texte des liens en gris-600, hover en Violet-600, chevron en Cyan */}
                            <li><Link to="/about" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> À Propos</Link></li>
                            <li><Link to="/services" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> Nos Services</Link></li>
                            <li><Link to="/experts" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> Trouver un Expert</Link></li>
                            <li><Link to="/faq" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> FAQ & Support</Link></li>
                        </ul>
                    </div>

                    {/* Colonne 3: Actions */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-5">Actions</h3>
                        <ul className="space-y-3">
                            <li><Link to="/poster-projet" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> Poster un Projet</Link></li>
                            <li><Link to="/devenir-expert" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> Devenir Freelance</Link></li>
                            <li><Link to="/portfolio" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> Voir notre Travail</Link></li>
                            <li><Link to="/carrieres" className="text-white hover:text-teal-200 transition text-sm flex items-center gap-1">
                                <IconChevronRight size={14} className="text-cyan-500" /> Carrières</Link></li>
                        </ul>
                    </div>

                    {/* Colonne 4: Contact Direct */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-5">Contact Direct</h3>
                        
                        {/* Icônes de contact en Violet-600 pour l'accent */}
                        <div className="flex items-start text-white text-sm mb-4">
                            <IconMail size={20} className="text-teal-200 mr-2 flex-shrink-0 mt-1" />
                            <a href="mailto:contact@visiocr.aft" className="hover:text-teal-200 transition">contact@visiocr.aft</a>
                        </div>
                        
                        <div className="flex items-start text-white text-sm">
                            <IconPhone size={20} className="text-teal-200 mr-2 flex-shrink-0 mt-1" />
                            <a href="tel:+21200000000" className="hover:text-teal-200 transition">+212 00 00 00 00</a>
                        </div>
                    </div>
                </div>

                {/* Section du Copyright et des Mentions Légales */}
                <div className="pt-8 md:flex md:items-center md:justify-between">
                    <p className="text-center text-sm text-gray-500 order-2 md:order-1">
                        &copy; <span id="year">{currentYear}</span> VisioCraft. Tous droits réservés.
                    </p>
                    {/* Les liens de la zone copyright passent en hover:text-gray-900 */}
                    <div className="flex justify-center space-x-6 mt-4 md:mt-0 order-1 md:order-2">
                        <Link to="/mentions" className="text-sm text-gray-500 hover:text-gray-900">Mentions Légales</Link>
                        <Link to="/politique" className="text-sm text-gray-500 hover:text-gray-900">Confidentialité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;