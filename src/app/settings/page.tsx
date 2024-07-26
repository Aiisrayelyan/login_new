"use client";

import { verifyAuth } from '../lib/auth';
import { useState, useEffect } from 'react';
import { handleChangeLogin } from '../lib/actions';
import { redirect } from 'next/navigation';

const Settings = () => {
    const [message, setMessage] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchAuth = async () => {
            const response = await fetch('/api/auth', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

            const auth = await response.json();
            console.log(auth);
            // const auth = await verifyAuth();

            if (!auth.user) {
                redirect('/login');
            } else {
                setUser(auth.user);
            }
        };

        fetchAuth();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = await handleChangeLogin(null, formData);
        if (result && result.message) {
            setMessage(result.message);
        }
    };

    if (!user) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Settings</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input type="password" id="currentPassword" name="currentPassword" required />
                </div>
                <div>
                    <label htmlFor="newLogin">New Login</label>
                    <input type="text" id="newLogin" name="newLogin" required />
                </div>
                <button type="submit">Change Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Settings;
