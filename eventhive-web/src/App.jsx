import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <--- Import this
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans">
       {/* This handles the notifications globally */}
       <Toaster 
         position="bottom-right"
         toastOptions={{
           style: {
             background: '#1e293b', // Slate-800
             color: '#fff',
             border: '1px solid #475569',
           },
         }}
       />
       
       <Navbar />
       <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
       </Routes>
    </div>
  )
}

export default App