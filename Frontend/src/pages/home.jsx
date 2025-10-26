import { Link } from "react-router-dom";
import HeroImage from "../../images/hero.jpg";

// SVG Icon Definitions (kept for consistency)
const IconPalette = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7c0 1.77 1.23 3.22 3 3.5v7h2v-7a3.5 3.5 0 0 1 3.5-3.5h7.5V12h-7.5a3.5 3.5 0 0 1-3.5-3.5V5a3 3 0 0 0-3-3z"/></svg>
);
const IconZap = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.5a3 3 0 0 1 2.5-3h11l-3-4H20l-5 8h5.5l-3 4H4a2.5 2.5 0 0 1-2.5 3.5h19"/></svg>
);
const IconMonitor = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
);
const IconUsers = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconFeather = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.67 19H20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-7.33"/><path d="m4.67 15.67 6.2-6.2"/></svg>
);
const IconTarget = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const IconActivity = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);
const IconGraduationCap = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.42 10.95c-.34-.95-1.27-1.6-2.43-1.6H5.01c-1.16 0-2.09.65-2.43 1.6L12 16.5l9.42-5.55z"/><path d="M4 19v-5c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v5"/><path d="M12 21v-4"/></svg>
);

const servicesData = [
    { title: "Visual Identity Design", desc: "Logo creation, Brand Guides, and defining memorable Typography.", icon: IconPalette, color: "violet" },
    { title: "Marketing Materials", desc: "High-impact Flyers, Banners, Brochures, Reels, and Carousels.", icon: IconZap, color: "cyan" },
    { title: "Website Design", desc: "Showcase websites, E-commerce platforms, and high-converting Landing Pages.", icon: IconMonitor, color: "violet" },
    { title: "Social Media Management", desc: "Strategic content scheduling, visual creation, and community engagement.", icon: IconUsers, color: "cyan" },
    { title: "AI-Powered Design", desc: "Integrating AI tools for streamlined workflows and rapid, precise design.", icon: IconFeather, color: "violet" },
    { title: "Brand Strategy", desc: "Communication consulting for clear messaging and market positioning.", icon: IconTarget, color: "cyan" },
    { title: "Digital Advertising", desc: "Management of Google Ads and Meta Ads campaigns for maximized ROI.", icon: IconActivity, color: "violet" },
    { title: "Creative Coaching", desc: "Customized training and mentorship to develop your team's creative skills.", icon: IconGraduationCap, color: "cyan" },
];

const Home = () => {
    return (
        <>
            {/* ========================================================================= */}
            {/* 1. HERO SECTION (Light Mode) */}
            {/* ========================================================================= */}
        <section className="relative h-[750px] flex items-center justify-center bg-white overflow-hidden">
    {/* Enhanced Background: Subtle gradient for depth and lightness */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div> {/* Removed opacity-90 for a more natural gradient */}

    <div className="container mx-auto px-6 relative z-10 h-full flex flex-col md:flex-row items-center justify-between text-gray-900">
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 
                className="text-5xl sm:text-7xl font-extrabold mb-6 max-w-4xl leading-snug"
            >
                The Future of Freelance. <span className="text-sky-600">Simplified.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto md:mx-0">
                Discover vetted experts or post your project instantly. Get quality work, guaranteed.
            </p>

            {/* CTAs (Button re-added) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/poster-projet">
                    <button
                        className="w-full sm:w-auto bg-sky-600 text-white hover:bg-violet-700 px-10 py-4 rounded-full font-bold text-lg 
                                   shadow-xl shadow-violet-300/60 transform hover:scale-[1.03] transition duration-300"
                    >
                        Post a Project 🚀
                    </button>
                </Link>
           
            </div>
        </div>

        {/* Image Section Enhanced (Focus here) */}
        <div className="md:w-1/2 flex justify-center md:justify-end relative"> {/* Added 'relative' here for pseudo-elements */}
            <img
                src={HeroImage} 
                alt="Freelancer working on a project with a client"
                className="w-full max-w-lg md:max-w-xl h-auto rounded-2xl object-cover 
                           relative z-10" // z-10 to ensure the image is above the pseudo-element
                style={{ 
                    maxHeight: "550px", 
                    // More pronounced shadow for a floating effect on the light background
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.03)", 
                    // Added subtle rotation and translation for a 3D effect
                    transform: "rotateY(-5deg) rotateX(5deg) translateZ(20px)", 
                    transition: "transform 0.5s ease-in-out", // Transition for interactivity
                }}
            />
            {/* Pseudo-element for "halo" or ambient light effect behind the image */}
            <div 
                className="absolute inset-0 bg-violet-200 rounded-2xl blur-xl opacity-30 
                           transform rotateY(-8deg) rotateX(8deg) translateZ(0px) scale(1.03)" 
                style={{ 
                    top: '20px', left: '20px', right: '-20px', bottom: '-20px', // Offset for projected shadow effect
                    transition: "transform 0.5s ease-in-out"
                }}
            ></div>
        </div>
    </div>
</section>
            {/* ========================================================================= */}
            {/* 2. SERVICES SECTION (Light Mode: Clean & Crisp) */}
            {/* ========================================================================= */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">
                        Our Core Areas of <span className="text-sky-600">Expertise</span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-16 text-center">
                        Every service is a pathway to measurable growth and impact.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {servicesData.map((service, index) => {
                            const IconComponent = service.icon;
                            const accentColor = service.color === 'violet' ? 'violet' : 'cyan';
                            
                            return (
                                <div 
                                    key={index}
                                    className={`group relative p-8 bg-white rounded-3xl border border-gray-100 shadow-xl 
                                                hover:border-${accentColor}-400 transition duration-500 
                                                transform hover:-translate-y-1 shadow-gray-200/50`}
                                >
                                    {/* Circular Icon Container */}
                                    <div className={`w-14 h-14 rounded-full bg-${accentColor}-100 text-${accentColor}-600 flex items-center justify-center mb-6 transition duration-300 group-hover:bg-${accentColor}-200`}>
                                        <IconComponent className="w-7 h-7 stroke-2"/>
                                    </div>
                                    
                                    <h3 className={`text-xl font-extrabold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-${accentColor}-700`}>
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {service.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

      
            {/* ========================================================================= */}
            {/* 4. CTA FOOTER (Light Mode) */}
            {/* ========================================================================= */}
            <section className="py-20 bg-gray-100 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-900">
                    <h2 className="text-4xl font-extrabold mb-6">
                        Need more information? <span className="text-cyan-600">Contact us.</span>
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-600">
                        We're here to answer your questions! Whether you have queries about our services or want to start a project.
                    </p>

                    <Link to="/contact">
                        <button className="bg-sky-600 hover:bg-teal-200 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-violet-300/50 transition-transform transform hover:scale-105">
                            Talk to an Expert 💬
                        </button>
                    </Link>
                </div>
            </section>
        </>
    );
};

export default Home;
