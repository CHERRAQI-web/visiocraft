import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    TextInput, 
    PasswordInput, 
    Button, 
    Paper, 
    Title, 
    Text, 
    Anchor, 
    Select,
    Textarea 
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
    IconUser, 
    IconMail, 
    IconLock, 
    IconBriefcase, 
    IconAddressBook, 
    IconChevronDown,
    IconBuilding, 
    IconGlobe,
    IconAward,
    IconFileDescription,
    IconPuzzle
} from '@tabler/icons-react';
import axios from 'axios';


const BASE_URL = "https://backend-visiocraft-production.up.railway.app/api/auth";
const AXIOS_CONFIG = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
};
 
/**
 * Registers a new user as a Client.
 */
const registerClient = async (formData) => {
    const { firstName, lastName, email, password, confirmPassword, companyName, industry } = formData; 
    
    try {
        const response = await axios.post(
            `${BASE_URL}/register-client`, 
            { 
                first_name: firstName, 
                last_name: lastName, 
                email, 
                password, 
                confirmPassword,
                company_name: companyName,
                industry: industry || '',
            },
            AXIOS_CONFIG
        );
        return { success: true, message: "Client account created successfully!", data: response.data };
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Registration failed due to server error.";
        return { success: false, message: errorMessage, data: error.response?.data };
    }
};

const registerFreelance = async (formData) => {
    // Split specialization into array and clean up spaces
    const skillsArray = formData.specialization
        .split(',')               // Example: "React.js, Node.js, UI/UX Design"
        .map(skill => skill.trim())        // ["React.js", "Node.js", "UI/UX Design"]
        .filter(skill => skill !== '');    // Filter out empty values

    const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        portfolio_url: formData.portfolioLink,
        skills: skillsArray,  // Directly pass the skills array
        bio: formData.bio,
    };

    try {
        const response = await axios.post(
            `${BASE_URL}/register-freelancer`, 
            payload, 
            AXIOS_CONFIG
        );
        return { success: true, message: "Freelancer account created successfully!", data: response.data };
    } catch (error) {
        console.error("Error during freelancer registration:", error);
        
        // API error handling
        const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
        return { success: false, message: errorMessage, data: error.response?.data };
    }
};

// ======================================================================
// 🔑 REGISTER PAGE COMPONENT
// ======================================================================

const RegisterPage = () => {
    const [role, setRole] = useState('client'); 
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 

    const [availableSkills, setAvailableSkills] = useState([]); 
    const [isSkillsLoading, setIsSkillsLoading] = useState(true); // Loading state

    // --- MODIFY THE `useEffect` ---
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get('https://backend-visiocraft-production.up.railway.app/api/skills'); 
                const skillsData = response.data.map(skill => ({
                    value: skill.name, 
                    label: skill.name, 
                }));
                setAvailableSkills(skillsData);
            } catch (error) {
                console.error("Failed to fetch skills:", error);
            } finally {
                setIsSkillsLoading(false); // Important: stop loading, even on error
            }
        };

        fetchSkills();
    }, []); // Empty array ensures this runs only once when the component loads.


    const form = useForm({
        initialValues: {
            role: 'client',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '', 
            // Client Fields
            companyName: '',
            industry: '',
            companyWebsite: '',
            // Freelancer Fields
            specialization: '', 
            portfolioLink: '',
            bio: '',
        },
        validate: (values) => {
            const errors = {};
            
            if (values.password !== values.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
            
            // Common validations
            if (!values.firstName) errors.firstName = 'First name is required';
            if (!values.lastName) errors.lastName = 'Last name is required';
            if (!values.email) errors.email = 'Email is required';
            if (!values.password) errors.password = 'Password is required';
            if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
            
            // Role-specific validations
            if (values.role === 'client') {
                if (!values.companyName) errors.companyName = "Company name is required for Clients.";
                if (!values.industry) errors.industry = "Industry is required for Clients.";
            }
            
            if (values.role === 'freelance') {
                if (!values.specialization) errors.specialization = "Your specialization is required.";
                if (!values.portfolioLink) errors.portfolioLink = "Portfolio link is required for Freelancers.";
                if (!values.bio) errors.bio = "A short bio is required for Freelancers.";
            }
            
            return errors;
        },
    });

    // In your RegisterPage.jsx component

    const handleFormSubmit = async (values) => {
        setLoading(true);
        let response = null;

        try {
            if (values.role === 'client') { 
                response = await registerClient(values);
            } else if (values.role === 'freelance') {
                // Transform specialization string into skills array
                const skillsArray = values.specialization
                    .split(',')   // "React.js, Node.js, UI/UX Design"
                    .map(skill => skill.trim())  // ["React.js", "Node.js", "UI/UX Design"]
                    .filter(skill => skill !== '');  // Remove empty values

                // Prepare data for sending
                const formDataForFreelancer = {
                    ...values,
                    skills: skillsArray  // Send skills as an array
                };

                // Call freelancer registration function
                response = await registerFreelance(formDataForFreelancer);
            }
            if (response && response.success) {
                alert(`Success! ${response.message}`);
                navigate('/login');
            } else {
                alert(`Registration Failed: ${response.message || "An unknown error occurred."}`);
                if (response.data && typeof response.data === 'object') {
                    form.setErrors(response.data);
                }
            }
        } catch (error) {
            console.error("API Connection Error:", error);
            alert("A critical network error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        form.setFieldValue('role', newRole);
        // Clear role-specific errors when switching roles
        if (newRole === 'client') {
            form.setErrors({
                ...form.errors,
                specialization: undefined,
                portfolioLink: undefined,
                bio: undefined
            });
        } else if (newRole === 'freelance') {
            form.setErrors({
                ...form.errors,
                companyName: undefined,
                industry: undefined
            });
        }
    };

    const renderRoleFields = () => {
        if (role === 'client') {
            return (
                <>
                    <TextInput
                        label="Company / Organization Name"
                        placeholder="E.g., VisioCraft Consulting"
                        required
                        icon={<IconBuilding size={16} />}
                        className="mb-4"
                        {...form.getInputProps('companyName')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />
                    <TextInput
                        label="Industry / Sector"
                        placeholder="E.g., Technology, Marketing, Finance"
                        required
                        icon={<IconPuzzle size={16} />}
                        className="mb-4"
                        {...form.getInputProps('industry')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />
                    <TextInput
                        label="Company Website (Optional)"
                        placeholder="https://your-company.com"
                        type="url"
                        icon={<IconGlobe size={16} />}
                        className="mb-4"
                        {...form.getInputProps('companyWebsite')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />
                </>
            );
        } else if (role === 'freelance') {
            return (
                <>
                    <TextInput
                        label="Your Specialization / Skills"
                        placeholder="E.g., Full-stack Developer, Designer UX/UI"
                        required
                        icon={<IconAward size={16} />}
                        className="mb-4"
                        {...form.getInputProps('specialization')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />
                    <TextInput
                        label="Portfolio / Profile Link (Required)"
                        placeholder="E.g., linkedin.com/in/..."
                        required
                        type="url"
                        icon={<IconGlobe size={16} />}
                        className="mb-4"
                        {...form.getInputProps('portfolioLink')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />
                    <Textarea
                        label="Short Bio (Required for Freelancers)"
                        placeholder="Tell us about yourself and your experience."
                        icon={<IconFileDescription size={16} />}
                        className="mb-4"
                        required
                        {...form.getInputProps('bio')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />
                </>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-10">
            <Paper 
                className="w-full max-w-lg p-8 sm:p-12 shadow-2xl rounded-xl bg-white border border-gray-100"
                withBorder 
                shadow="xl"
            >
                <Title order={2} className="text-center font-extrabold tracking-tight text-gray-900 mb-2">
                    Join <span className="text-cyan-600">VisioCraft</span>
                </Title>
                <Text color="dimmed" size="sm" align="center" mt={5} mb={30}>
                    Already have an account?{' '}
                    <Anchor component={Link} to="/login" size="sm" className="text-violet-600 hover:text-violet-700 font-medium">
                        Log in here
                    </Anchor>
                </Text>

                <form onSubmit={form.onSubmit(handleFormSubmit)}>
                    <Select
                        label="I am registering as"
                        placeholder="Select your role"
                        required
                        value={role}
                        onChange={handleRoleChange} 
                        data={[
                            { value: 'client', label: 'Client (To post projects)' },
                            { value: 'freelance', label: 'Freelance (To find jobs)' },
                        ]}
                        icon={<IconBriefcase size={16} />}
                        rightSection={<IconChevronDown size={14} />}
                        className="mb-6"
                        styles={(theme) => ({
                            input: { borderColor: theme.colors.gray[3] },
                            item: { color: theme.colors.gray[8], '&[data-selected]': { backgroundColor: theme.colors.cyan[1], color: theme.colors.cyan[7] } }
                        })}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <TextInput
                            label="First Name"
                            placeholder="Your first name"
                            required
                            icon={<IconUser size={16} />}
                            {...form.getInputProps('firstName')}
                            styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                        />
                        <TextInput
                            label="Last Name"
                            placeholder="Your last name"
                            required
                            {...form.getInputProps('lastName')}
                            styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                        />
                    </div>
                    
                    <TextInput
                        label="Email Address"
                        placeholder="your.email@example.com"
                        required
                        type="email"
                        icon={<IconMail size={16} />}
                        className="mb-4"
                        {...form.getInputProps('email')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />

                    {renderRoleFields()}

                    <PasswordInput
                        label="Password"
                        placeholder="Choose a strong password"
                        required
                        icon={<IconLock size={16} />}
                        className="mb-4"
                        {...form.getInputProps('password')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />
                    
                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        required
                        icon={<IconLock size={16} />}
                        className="mb-6"
                        {...form.getInputProps('confirmPassword')}
                        styles={(theme) => ({ input: { borderColor: theme.colors.gray[3] } })}
                    />

                    <Button 
                        type="submit" 
                        fullWidth 
                        size="lg"
                        loading={loading}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-300/50"
                        leftIcon={<IconAddressBook size={20} />}
                    >
                        Create My Account
                    </Button>
                </form>
            </Paper>
        </div>
    );
};

export default RegisterPage;
