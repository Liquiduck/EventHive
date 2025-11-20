import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 hover:opacity-80 transition">
                EventHive
            </Link>

            {/* Buttons */}
            <div className="flex items-center gap-4">
                {token ? (
                    /* LOGGED IN USER SEES THIS: */
                    <>
                        {/* 👇 THIS IS THE NEW LINK 👇 */}
                        <Link to="/dashboard" className="text-slate-300 hover:text-purple-400 font-semibold transition mr-2">
                            My Events
                        </Link>

                        <button 
                            onClick={handleLogout}
                            className="border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-5 py-2 rounded-lg font-bold transition duration-300"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    /* GUESTS SEE THIS: */
                    <>
                        <Link 
                            to="/login" 
                            className="bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white px-5 py-2 rounded-lg font-bold transition duration-300"
                        >
                            Login
                        </Link>
                        
                        <Link 
                            to="/register" 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition duration-300"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;