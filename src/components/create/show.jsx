import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { api } from '../api';
import '../../css/show.css';

export function Show() {
    const location = useLocation();
    const code = location.state?.code || 'No code available';
    const [data, setData] = useState([]);
    const [newData, setNewData] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(api + "/Get", { code });
            console.log('API Response:', res.data);
            setData(Array.isArray(res?.data.data) ? res.data.data : []);
        } catch (e) {
            console.log(e);
            setError('Failed to fetch data');
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [code]);

    const appendData = async () => {
        if (!newData.trim()) {
            alert('Please enter some data to append');
            return;
        }

        const updatedData = [...data, newData];
        setData(updatedData);

        try {
            const res = await axios.post(api + "/Update", { code, data: updatedData });
            alert(res.data.message);
            setNewData("");
        } catch (e) {
            console.log(e);
            setError('Failed to update data');
            setData(data);
        }
    };

    return (
        <div className="main">
            <div className="show-container">
                <h1 className="show-title">Code of the Space: {code}</h1>
                <div className="show-data-container">
                    {error && <p className="show-error">{error}</p>}
                    {isLoading ? (
                        <p className="show-loading">Loading...</p>
                    ) : data.length > 0 ? (
                        <ul className="show-data-list">
                            {data.map((item, index) => (
                                <li className="show-data-item" key={index}>
                                    <pre>{item}</pre>
                                </li>
                            ))}
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
            </div>
        </div>
    );
}