import { useState, useEffect } from "react";

// Replacing @tabler/icons-react imports with inline SVG components
// to ensure compatibility and self-sufficiency of the file.

const IconUser = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const IconMail = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const IconMessage = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const IconLoader2 = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

const IconMapPin = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
);

const IconPhone = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.74a17.51 17.51 0 0 0 .58 3.02a2 2 0 0 1-.41 2.51L7.15 11.83a14 14 0 0 0 5.04 5.04l2.6-2.6a2 2 0 0 1 2.51-.41a17.51 17.51 0 0 0 3.02.58a2 2 0 0 1 1.74 2V22"/></svg>
);

const IconBrandFacebook = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const IconBrandLinkedin = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const IconBrandTwitter = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6c2.2.1 4.4-.6 6-2a6.7 6.7 0 0 1-4-5.3c.7.1 1.3.1 2-.1c-1.3-.8-2.2-2.3-2.3-4.1c.3.1.6.2.9.2c-1.1-.7-1.7-2-1.7-3.4c0-1.6.7-3 1.9-4.1c2.4 3 5.9 5.1 9.7 5.3c-.1-.7-.2-1.3-.2-2a4 4 0 0 1 4-4c1.1 0 2.1.4 2.8 1.2c.9-.2 1.8-.5 2.6-1c-.3.9-.9 1.8-1.6 2.3c.8-.1 1.6-.3 2.3-.6c-.5.8-1 1.5-1.7 2.1z"/></svg>
);

const IconCheck = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

const IconX = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
);


const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  // status can be: null, 'success', 'error', 'pending'
  const [status, setStatus] = useState(null); 
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailJsReady, setIsEmailJsReady] = useState(false);

  // EmailJS credentials (The import.meta.env variables must be defined in your project)
  const emailJsUserId = import.meta.env.VITE_EMAILJS_USER_ID;
  const emailJsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailJsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  // Configuration and loading of EmailJS
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.async = true;
    script.onload = () => {
      if (window.emailjs) {
        // The import.meta.env warning is ignored here, as it's necessary for the EmailJS service.
        if (emailJsUserId) {
          window.emailjs.init(emailJsUserId);
          setIsEmailJsReady(true);
        } else {
          console.error("EmailJS User ID is missing.");
          setStatus('error');
          setStatusMessage("Error: Missing EmailJS User ID.");
        }
      }
    };
    script.onerror = () => {
      console.error("Failed to load EmailJS SDK.");
      setStatus('error');
      setStatusMessage(
        "Error: Unable to load the email sending service."
      );
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [emailJsUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.message.trim() !== "";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEmailJsReady) {
      setStatus('pending');
      setStatusMessage(
        "The email sending service is not ready yet. Please wait."
      );
      return;
    }

    if (isFormValid) {
      setIsSubmitting(true);
      setStatus(null);
      
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
      };

      if (window.emailjs) {
        window.emailjs
          .send(emailJsServiceId, emailJsTemplateId, templateParams)
          .then(
            (result) => {
              console.log("Email successfully sent!", result.text);
              setStatus('success');
              setStatusMessage(
                "Message sent successfully! We will respond within 24 hours."
              );
              setFormData({ name: "", email: "", message: "" });
              setTimeout(() => {
                setStatus(null);
                setStatusMessage("");
              }, 6000);
            },
            (error) => {
              console.error("Email sending failed:", error.text);
              setStatus('error');
              setStatusMessage(
                "Failed to send the message. Please check your information and try again."
              );
              setTimeout(() => {
                setStatus(null);
                setStatusMessage("");
              }, 6000);
            }
          )
          .finally(() => {
            setIsSubmitting(false);
          });
      } else {
        console.error("EmailJS SDK not loaded.");
        setStatus('error');
        setStatusMessage(
          "Critical error: Message sending failed. Please try again later."
        );
        setIsSubmitting(false);
      }
    } else {
      setStatus('error');
      setStatusMessage("Please fill in all required fields.");
      setTimeout(() => {
        setStatus(null);
        setStatusMessage("");
      }, 5000);
    }
  };

  // Dynamic styles for status
  const getStatusClasses = () => {
      if (status === 'success') return "bg-green-100 text-green-700 border-green-400";
      if (status === 'error') return "bg-red-100 text-red-700 border-red-400";
      if (status === 'pending') return "bg-yellow-100 text-yellow-700 border-yellow-400";
      return "";
  }
  
  // Component rendering
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Contact our team
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            We're here to answer all your questions.
          </p>
        </div>

        {/* --- Main Container (Split Layout) --- */}
        <div className="flex flex-col lg:flex-row shadow-2xl rounded-3xl overflow-hidden">
          
          {/* 1. Information Block (Left Side) */}
          <div className="lg:w-1/3 bg-sky-600 p-8 sm:p-12 text-white flex flex-col justify-between">
            <div>
                <h2 className="text-3xl font-bold mb-4">Key Information</h2>
                <p className="text-violet-200 mb-8">
                    Prefer to contact us directly? Here's how to find us.
                </p>

                <div className="space-y-6">
                    {/* Address */}
                    <div className="flex items-start space-x-4">
                        <IconMapPin size={24} className="text-violet-300 flex-shrink-0 mt-1"/>
                        <div>
                            <p className="font-semibold text-lg">Our Office</p>
                            <p className="text-violet-200">123 Creation Street, 75000 Paris, France</p>
                        </div>
                    </div>
                    {/* Phone */}
                    <div className="flex items-start space-x-4">
                        <IconPhone size={24} className="text-violet-300 flex-shrink-0 mt-1"/>
                        <div>
                            <p className="font-semibold text-lg">Call Us</p>
                            <a href="tel:+33123456789" className="text-violet-200 hover:text-white transition">+33 1 23 45 67 89</a>
                        </div>
                    </div>
                    {/* Email */}
                    <div className="flex items-start space-x-4">
                        <IconMail size={24} className="text-violet-300 flex-shrink-0 mt-1"/>
                        <div>
                            <p className="font-semibold text-lg">General Email</p>
                            <a href="mailto:contact@visiocraft.com" className="text-violet-200 hover:text-white transition">contact@visiocraft.com</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="mt-10 pt-6 border-t border-violet-600">
                <p className="font-semibold mb-3">Follow Us</p>
                <div className="flex space-x-4">
                    <a href="#" aria-label="Facebook" className="text-violet-300 hover:text-white transition">
                        <IconBrandFacebook size={24} />
                    </a>
                    <a href="#" aria-label="LinkedIn" className="text-violet-300 hover:text-white transition">
                        <IconBrandLinkedin size={24} />
                    </a>
                    <a href="#" aria-label="Twitter" className="text-violet-300 hover:text-white transition">
                        <IconBrandTwitter size={24} />
                    </a>
                </div>
            </div>
          </div>

          {/* 2. Form Block (Right Side) */}
          <div className="lg:w-2/3 bg-white p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Status Message */}
              {statusMessage && (
                <div className={`p-4 rounded-lg border flex items-center space-x-3 transition-opacity duration-300 ${getStatusClasses()}`}>
                    {status === 'success' && <IconCheck size={20} className="flex-shrink-0"/>}
                    {status === 'error' && <IconX size={20} className="flex-shrink-0"/>}
                    {status === 'pending' && <IconLoader2 size={20} className="flex-shrink-0 animate-spin"/>}
                    <p className="font-medium text-sm">{statusMessage}</p>
                </div>
              )}

              {/* Name Input */}
              <div className="relative">
                <IconUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Your Full Name *"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition shadow-sm"
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <IconMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="Your Professional Email *"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition shadow-sm"
                />
              </div>

              {/* Message Textarea */}
              <div className="relative">
                <IconMessage className="absolute left-4 top-4 text-gray-400" size={20} />
                <textarea
                  required
                  name="message"
                  placeholder="Your Message (project details, questions...)*"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition shadow-sm resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="group relative flex justify-center items-center space-x-2 w-full px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                    <>
                        <IconLoader2 size={20} className="animate-spin" />
                        <span>Sending...</span>
                    </>
                ) : (
                    "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;