import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // Connect to the /login route we built in Python!
            const response = await axios.post('http://127.0.0.1:5000/login', formData);
            
            // SAVE THE TOKEN (This is the most important part)
            localStorage.setItem('token', response.data.access_token);
            
            // Redirect to home
            navigate('/');
            window.location.reload(); // Reload to update Navbar state
        } catch (err) {
            setError(err.response?.data?.msg || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back 👋</h2>
                
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-400 mb-2">Email</label>
                        <input 
                            type="email" name="email" 
                            className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                            onChange={handleChange} required
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 mb-2">Password</label>
                        <input 
                            type="password" name="password" 
                            className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                            onChange={handleChange} required
                        />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;