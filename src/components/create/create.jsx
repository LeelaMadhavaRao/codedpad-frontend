import axios from 'axios';
import { useState } from "react";
import { api } from '../api';
import '../../css/create.css';
import { useNavigate } from 'react-router-dom';

export function Create() {
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const checkMe = async (e) => {
        e.preventDefault();
        
        if (code === "") {
            alert('please enter a code');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await axios.post(api + '/create', { code: code });
            if (res.data === 'success') {
                alert('Code created successfully');
                nav('open');
            } else {
                alert('code already exists');
            }
        } catch (e) {
            console.log(e);
            setError('An error occurred while creating the space');
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
                    />
                    <button 
                        type='submit'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button><br></br>
                    <p>Already exist code?
                        <a href='/open'>Open</a>
                    </p>
                </div>
                {error && <p className='error' style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}