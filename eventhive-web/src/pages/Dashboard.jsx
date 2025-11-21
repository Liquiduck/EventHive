import { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await api.get('/my_events', {
                    headers: { Authorization: `Bearer ${token}` } // Send the ID Card
                });
                setEvents(response.data);
            } catch (err) {
                console.error("Error loading dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await api.delete(`/delete_event/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from screen instantly without reloading
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            alert("Failed to delete event");
        }
    };

    if (loading) return <div className="text-center mt-20 text-white">Loading your collection...</div>;

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">My Personal Hive 🐝</h1>
            
            {events.length === 0 ? (
                <div className="text-center text-slate-400">
                    <p className="text-xl">You haven't saved any events yet.</p>
                    <Link to="/" className="inline-block mt-4 text-purple-400 hover:text-purple-300 underline">Go find some!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {events.map((event) => (
                        <div key={event.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                            <img src={event.image} alt={event.name} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                                <p className="text-slate-400 text-sm mb-4">📅 {event.date}</p>
                                
                                <div className="flex gap-2">
                                    <a href={event.url} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-center py-2 rounded-lg font-bold">
                                        Buy
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(event.id)}
                                        className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/30 py-2 rounded-lg font-bold transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;