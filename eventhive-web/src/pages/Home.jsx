import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast'; // Pro Notifications
import { motion } from 'framer-motion'; // Pro Animations

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [city, setCity] = useState("New York");
    const [searchInput, setSearchInput] = useState("");

    // --- ANIMATION VARIANTS ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 } // Each card loads 0.1s after the previous
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 }, // Start invisible and slightly down
        visible: { opacity: 1, y: 0 }   // Fade in and move up
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCity(searchInput);
    };

    const saveEvent = async (event) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            // ❌ Error Toast
            toast.error("You must be logged in to save events!");
            return;
        }

        try {
            await api.post('/login', event, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // ✅ Success Toast
            toast.success(`Saved ${event.name} to your Hive! 🐝`);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                toast("You already saved this event!", { icon: '👀' });
            } else {
                toast.error("Failed to save event.");
            }
        }
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/events?city=${city}');
                setEvents(response.data);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError(`Could not find events in ${city}. Try another city!`);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [city]);

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Hero Section */}
            <div className="bg-slate-800 py-10 mb-8 shadow-2xl border-b border-slate-700 relative overflow-hidden">
                {/* Subtle Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 animate-pulse"></div>
                
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl font-extrabold mb-6"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            EventHive
                        </span>
                    </motion.h1>
                    
                    <motion.form 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        onSubmit={handleSearch} 
                        className="max-w-md mx-auto flex gap-2"
                    >
                        <input 
                            type="text" 
                            placeholder="Search by City (e.g., London, Toronto)..." 
                            className="flex-1 p-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all"
                        >
                            Search
                        </motion.button>
                    </motion.form>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"
                    ></motion.div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center text-red-400 font-bold text-xl animate-bounce">
                    {error}
                </div>
            )}

            {/* Grid Section */}
            {!loading && !error && (
                <motion.div 
                    className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {events.map((event) => (
                        <motion.div 
                            key={event.id} 
                            variants={cardVariants}
                            whileHover={{ y: -10, transition: { duration: 0.2 } }}
                            className="group bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-colors shadow-lg hover:shadow-2xl hover:shadow-purple-500/10"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img 
                                    src={event.image} 
                                    alt={event.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-lg border border-white/20 shadow-lg">
                                    <p className="font-bold text-xs uppercase tracking-wider">{event.date}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                                    {event.name}
                                </h3>
                                <p className="text-slate-400 text-sm mb-6 flex items-center">
                                    📍 {event.venue} • ⏰ {event.time}
                                </p>
                                
                                <div className="flex flex-col gap-3">
                                    {event.url ? (
                                        <a 
                                            href={event.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg transform transition hover:scale-[1.02]"
                                        >
                                            Get Tickets 🎟️
                                        </a>
                                    ) : (
                                        <button disabled className="block w-full text-center py-3 rounded-xl font-bold text-slate-500 bg-slate-700 cursor-not-allowed">
                                            Sold Out
                                        </button>
                                    )}

                                    <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => saveEvent(event)}
                                        className="block w-full text-center py-3 rounded-xl font-bold text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
                                    >
                                        ❤️ Save Event
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default Home;