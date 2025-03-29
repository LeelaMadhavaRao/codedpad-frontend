import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import '../../css/show.css';

export function Show() {
    const location = useLocation();
    const code = location.state?.code || 'No code available';
    const [data, setData] = useState([]);
    const [newData, setNewData] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedValue, setEditedValue] = useState("");
    const [message, setMessage] = useState(""); // Popup message text
    const [showMessage, setShowMessage] = useState(false); // Popup visibility
    const [showConfirm, setShowConfirm] = useState(false); // Confirmation popup visibility
    const timeoutRef = useRef(null); // For managing displayMessage timeouts

    const fetchData = async (setLoading = true) => {
        if (setLoading) setIsLoading(true);
        try {
            const res = await axios.post(api + "/Get", { code });
            console.log('API Response:', res.data);
            setData(Array.isArray(res?.data.data) ? res.data.data : []);
        } catch (e) {
            console.log(e);
            setError('Failed to fetch data');
            setData([]);
        } finally {
            if (setLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
    }, [code]);

    // Function to show popup message
    const displayMessage = (msg, callback = null) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setMessage(msg);
        setShowMessage(true);

        timeoutRef.current = setTimeout(() => {
            setShowMessage(false);
            setMessage("");
            timeoutRef.current = null;
            if (callback) callback();
        }, 2000); // Hide after 2 seconds
    };

    const appendData = async () => {
        if (!newData.trim()) {
            displayMessage('Please enter some data to append');
            return;
        }

        const updatedData = [...data, newData];
        setData(updatedData);

        try {
            await axios.post(api + "/Update", { code, data: updatedData });
            setNewData("");
            displayMessage('Data appended successfully');
        } catch (e) {
            console.log(e);
            setError('Failed to update data');
            setData(data);
            displayMessage('Failed to append data');
        }
    };

    const deleteItem = async (index) => {
        const originalData = [...data];
        const updatedData = data.filter((_, i) => i !== index);
        setData(updatedData);

        try {
            await axios.post(api + "/Update", { code, data: updatedData });
            fetchData(false);
            displayMessage('Item deleted successfully');
        } catch (e) {
            console.log(e);
            setError('Failed to update data');
            setData(originalData);
            displayMessage('Failed to delete item');
        }
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditedValue(data[index]);
    };

    const saveEdit = async () => {
        if (editingIndex === null) return;

        const originalData = [...data];
        const updatedData = [...data];
        updatedData[editingIndex] = editedValue;
        setData(updatedData);

        try {
            await axios.post(api + "/Update", { code, data: updatedData });
            setEditingIndex(null);
            setEditedValue("");
            displayMessage('Item edited successfully');
        } catch (e) {
            console.log(e);
            setError('Failed to update data');
            setData(originalData);
            displayMessage('Failed to edit item');
        }
    };

    const discard = (code) => {
        setShowConfirm(true); // Show the confirmation popup
    };

    const handleConfirmDiscard = async () => {
        setShowConfirm(false); // Hide confirmation popup
        try {
            await axios.post(api + "/Delete", { code });
            displayMessage('Space discarded successfully', () => {
                window.location.href = '/create';
            });
        } catch (e) {
            console.log(e);
            setError('Failed to discard space');
            displayMessage('Failed to discard space');
        }
    };

    const handleCancelDiscard = () => {
        setShowConfirm(false); // Simply hide the confirmation popup
    };

    return (
        <div className="main">
            <div className="show-container">
                <h1 className="show-title">
                    Code of the Space: {code} <button onClick={() => discard(code)}>Discard</button>
                </h1>
                <div className="show-data-container">
                    {error && <p className="show-error">{error}</p>}
                    {isLoading ? (
                        <p className="show-loading">Loading...</p>
                    ) : data.length > 0 ? (
                        <ul className="show-data-list">
                            {[...data].reverse().map((item, reversedIndex) => {
                                const originalIndex = data.length - 1 - reversedIndex;
                                return (
                                    <li className="show-data-item" key={originalIndex}>
                                        {editingIndex === originalIndex ? (
                                            <div className="edit-area">
                                                <textarea
                                                    value={editedValue}
                                                    onChange={(e) => setEditedValue(e.target.value)}
                                                    rows={4}
                                                    cols={50}
                                                    style={{ width: '100%' }}
                                                />
                                                <div className="edit-buttons">
                                                    <button onClick={saveEdit}>Save</button>
                                                    <button onClick={() => setEditingIndex(null)}>Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <pre>{item}</pre>
                                        )}
                                        <div className="icons">
                                            {editingIndex !== originalIndex && (
                                                <>
                                                    <img
                                                        src="copy.png"
                                                        alt="copy"
                                                        onClick={() =>
                                                            navigator.clipboard
                                                                .writeText(item)
                                                                .then(() => displayMessage('Copied to clipboard'))
                                                                .catch(() => displayMessage('Failed to copy'))
                                                        }
                                                    />
                                                    <img
                                                        src="edit.png"
                                                        alt="edit"
                                                        onClick={() => startEditing(originalIndex)}
                                                    />
                                                    <img
                                                        src="delete.png"
                                                        alt="delete"
                                                        onClick={() => deleteItem(originalIndex)}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="show-no-data">No data available</p>
                    )}
                </div>
                <div className="show-input-area">
                    <textarea
                        className="show-textarea"
                        placeholder="Enter new data..."
                        value={newData}
                        onChange={(e) => setNewData(e.target.value)}
                        rows={4}
                        cols={50}
                    />
                    <button className="show-append-button" onClick={appendData}>
                        Append
                    </button>
                </div>
                {/* Popup Message */}
                {showMessage && (
                    <div className="popup-message" role="alert" aria-live="polite">
                        {message}
                    </div>
                )}
                {/* Confirmation Popup */}
                {showConfirm && (
                    <div className="popup-confirm">
                        <p>Are you sure you want to discard this space? This action cannot be undone.</p>
                        <div className="confirm-buttons">
                            <button onClick={handleConfirmDiscard} className='yesButton'>Yes</button>
                            <button onClick={handleCancelDiscard} className='noButton'>No</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}