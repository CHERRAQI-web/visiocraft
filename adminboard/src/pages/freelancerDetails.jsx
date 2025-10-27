import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { ArrowLeft, User, Mail, Briefcase, Calendar, Tag, Phone, MapPin, Globe, Clock } from 'lucide-react';

const FreelancerDetails = () => {
    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { freelancerId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFreelancerDetails = async (id) => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(`http://backend-visiocraft-production.up.railway.app/api/freelancers/${id}`);
                setFreelancer(response.data);
                
            } catch (err) {
                console.error("Error fetching details:", err);
                setError(err.response?.data?.message || "Error loading freelancer details");
            } finally {
                setLoading(false);
            }
        };

        if (freelancerId) {
            fetchFreelancerDetails(freelancerId);
        }
    }, [freelancerId]);

    const handleGoBack = () => {
        navigate('/freelancer');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md w-full">
                    <h3 className="font-semibold mb-2">Error</h3>
                    <p>{error}</p>
                    <button 
                        onClick={handleGoBack}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors w-full sm:w-auto"
                    >
                        Back to list
                    </button>
                </div>
            </div>
        );
    }

    if (!freelancer) {
        return (
            <div className="flex justify-center items-center min-h-screen p-4">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Freelancer not found</p>
                    <button 
                        onClick={handleGoBack}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                        Back to list
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
            {/* Back button */}
            <button 
                onClick={handleGoBack}
                className="flex items-center gap-2 mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to list
            </button>

            {/* Main card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold">{freelancer.username}</h1>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-blue-100">
                                <Mail className="w-4 h-4" />
                                <span className="break-all">{freelancer.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Main information */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    Portfolio
                                </h3>
                                {freelancer.portfolio ? (
                                    <a 
                                        href={freelancer.portfolio} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline break-all flex items-center gap-2"
                                    >
                                        <Globe className="w-4 h-4" />
                                        {freelancer.portfolio}
                                    </a>
                                ) : (
                                    <span className="text-gray-400">Not specified</span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created on:</span>
                                        <span className="text-gray-900">
                                            {new Date(freelancer.createdAt).toLocaleDateString('en-US')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Modified on:</span>
                                        <span className="text-gray-900">
                                            {new Date(freelancer.updatedAt).toLocaleDateString('en-US')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills and Bio */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-blue-600" />
                                    Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {freelancer.skills && freelancer.skills.length > 0 ? (
                                        freelancer.skills.map((skill, index) => (
                                            <span 
                                                key={index} 
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400">No skills specified</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Biography</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {freelancer.bio || 'No biography specified'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact information section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {freelancer.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-700">{freelancer.phone}</span>
                                </div>
                            )}
                            {freelancer.location && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-700">{freelancer.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FreelancerDetails;