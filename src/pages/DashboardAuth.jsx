import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { setAdminToken } from '../services/auth';

const DashboardAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, error, clearError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple test to verify credentials
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Password length:', password.length);
    console.log('Form data type:', typeof email, typeof password);
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      setLoading(false);
      return;
    }

    // Create credentials object explicitly
    const credentials = {
      email: email.trim(),
      password: password
    };
    
    console.log('Credentials object:', credentials);
    console.log('Credentials JSON:', JSON.stringify(credentials));

    try {
      const result = await login(credentials);
      
      if (result.success) {
        toast.success('Login successful! Redirecting...', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Use timeout to prevent throttling
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        toast.error('Invalid email or password', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
    } catch (err) {
      console.error('DashboardAuth Login Error:', err);
      toast.error(`Failed to login: ${err.message}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link to="/">
        <div className='bg-black text-white font-semibold text-lg px-4 py-3 rounded-full fixed md:absolute top-4 left-4 md:top-10 md:left-10 z-10'>
          <h1>Go Back Home</h1>
        </div>
      </Link>
      
      <div className="w-full min-h-screen flex justify-center items-center bg-gray-600 p-4">
        <ToastContainer />
        <div className="shadow-4xl w-full md:w-5/6 lg:w-3/5 xl:w-2/5 2xl:w-1/3 rounded-2xl border border-gray-400 bg-gray-400 p-6">
          <h2 className='w-full border-b-2 text-center border-gray-600 font-semibold text-2xl md:text-3xl p-4'>
            Sign in as Admin
          </h2>
          
          <form onSubmit={handleLogin} className='grid grid-cols-1 gap-4 w-full md:w-4/5 mx-auto mt-6 md:mt-10'>
            <div>
              <label htmlFor="email" className='block mb-2 font-medium'>Email</label>
              <input 
                className='outline-none w-full rounded-3xl p-3 pl-5 bg-gray-100 focus:bg-gray-900 focus:text-white transition-colors duration-300' 
                type="email" 
                name="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className='block mb-2 font-medium'>Password</label>
              <input 
                className='outline-none w-full rounded-3xl p-3 pr-12 bg-gray-100 focus:bg-gray-900 focus:text-white transition-colors duration-300' 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center mt-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.529l5.144 5.144a4.002 4.002 0 005.294.001 9.997 9.997 0 012.22 15.467l-5.144-5.144z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className='bg-black transition duration-300 border-b-4 border-l-4 border-gray-700 hover:bg-gray-800 text-white p-3 font-semibold rounded-lg mt-4 disabled:opacity-50'
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default DashboardAuth;