import axios from 'axios';
import { useState } from "react";
import { api } from '../api';
import '../../css/create.css';
import { useNavigate } from 'react-router-dom';

export function OpenMe() { 
    const [code, setCode] = useState(""); 
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const openMe = async (e) => {
        e.preventDefault(); 
        
        if (code === "") {
            alert('please enter a code');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await axios.post(api + '/Open', {code: code }); 
            if (!res.data.success) {
                alert('code doesn\'t exist');
                nav('/create'); 
            } else {
                setData(res.data);
                
                nav('/show', { state: { code: code } }); 
            }
        } catch (e) {
            console.log(e);
            setError('An error occurred while opening the space');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='outer'>
            <h2>Enter your unique code to Open your space</h2>
            <form onSubmit={openMe}>
                <div className='inner'>
                    <input 
                        type='text' 
                        placeholder='code' 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        type='submit'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Opening...' : 'Open'}
                    </button>
                    <p>No code?
                        <a href='/'>Create</a>
                    </p>
                </div>
                {error && <p className='error' style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}