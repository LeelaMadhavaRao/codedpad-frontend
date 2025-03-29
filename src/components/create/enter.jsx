import axios from 'axios';
import { useState, useRef } from "react";
import { api } from '../api';
import '../../css/create.css';
import { useNavigate } from 'react-router-dom';

export function OpenMe() {
    const [code, setCode] = useState("");
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(""); // Popup message text
    const [showMessage, setShowMessage] = useState(false); // Popup visibility
    const nav = useNavigate();
    const timeoutRef = useRef(null); // To store timeout ID for cleanup

    const displayMessage = (msg, callback = null) => {
        // Clear any existing timeout to avoid overlap
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setMessage(msg);
        setShowMessage(true);

        timeoutRef.current = setTimeout(() => {
            setShowMessage(false);
            setMessage(""); // Reset message after hiding
            timeoutRef.current = null; // Clear the ref
            if (callback) callback(); // Execute callback (e.g., navigation) after popup hides
        }, 2000); // Hide after 2 seconds
    };

    const openMe = async (e) => {
        e.preventDefault();

        if (!code.trim()) { // Check for whitespace-only input
            displayMessage('Please enter a code');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${api}/Open`, { code });
            if (!res.data.success) {
                displayMessage("Code doesn't exist", () => nav('/create'));
            } else {
                setData(res.data);
                displayMessage('Code opened successfully', () => 
                    nav('/show', { state: { code } })
                );
            }
        } catch (e) {
            console.error('Error in openMe:', e);
            const errorMsg = e.response?.data?.message || 'An error occurred while opening the space';
            displayMessage(errorMsg);
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='outer'>
            <h2>Enter your unique code to open your space</h2>
            <form onSubmit={openMe}>
                <div className='inner'>
                    <input
                        type='text'
                        placeholder='code'
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isLoading}
                        aria-label="Enter your unique code"
                    />
                    <button
                        type='submit'
                        disabled={isLoading}
                        aria-busy={isLoading}
                    >
                        {isLoading ? 'Opening...' : 'Open'}
                    </button>
                    <p>
                        No code? <a href='/'>Create</a>
                    </p>
                </div>
                {error && (
                    <p className='error' style={{ color: 'red' }}>
                        {error}
                    </p>
                )}
            </form>
            {showMessage && (
                <div
                    className="popup-message"
                    role="alert"
                    aria-live="polite"
                >
                    {message}
                </div>
            )}
        </div>
    );
}