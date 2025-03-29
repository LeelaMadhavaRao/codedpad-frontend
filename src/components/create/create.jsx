import { api } from '../api';
import '../../css/create.css';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import axios from 'axios';

export function Create() {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(""); // Popup message text
    const [showMessage, setShowMessage] = useState(false); // Popup visibility
    const nav = useNavigate();
    const timeoutRef = useRef(null); // To store timeout ID for cleanup

    const displayMessage = (msg) => {
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
        }, 2000); // Hide after 2 seconds
    };

    const checkMe = async (e) => {
        e.preventDefault();

        if (!code.trim()) { // Use trim() to catch whitespace-only input
            displayMessage('Code cannot be empty');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${api}/create`, { code });
            if (res.data === 'success') {
                displayMessage('Code created successfully');
                setTimeout(() => nav('/open'), 2100); // Navigate after popup hides
            } else if (res.data === 'code already exists') {
                displayMessage('Code already exists');
            } else {
                displayMessage('Unexpected response from server');
            }
        } catch (e) {
            console.error('Error in checkMe:', e);
            const errorMsg = e.response?.data?.error || 'An error occurred while creating the space';
            displayMessage(errorMsg); // Show error in popup
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='outer'>
            <h2>Enter a unique code to create your space</h2>
            <form onSubmit={checkMe}>
                <div className='inner'>
                    <input
                        type='text'
                        placeholder='code'
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isLoading}
                        aria-label="Enter a unique code"
                    />
                    <button
                        type='submit'
                        disabled={isLoading}
                        aria-busy={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                    <br />
                    <p>
                        Already have a code? <a href='/open'>Open</a>
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