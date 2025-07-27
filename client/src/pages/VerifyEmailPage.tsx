// frontend/src/pages/VerifyEmailPage.tsx
import { useEffect, useState } from 'react';
import { verifyEmail } from '../api/authService';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const VerifyEmailPage = () => {
    const [message, setMessage] = useState('Verifying your email...');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const Spinner = () => (
        <FaSpinner className="animate-spin text-blue-500 text-xl mt-4" />
    );

    useEffect(() => {
        const verify = async () => {
            const token = new URLSearchParams(window.location.search).get('token');
            if (!token) {
                setMessage('Missing verification token.');
                setIsLoading(false);
                return;
            }

            try {
                const result = await verifyEmail(token.trim());
                if (result.verified) {
                    setMessage(result.message || "Email verified successfully!");
                } else {
                    setMessage(result.error || "Verification failed");
                }
            } catch (err) {
                setMessage("Still processing... please wait");
                // Automatic retry after delay
                setTimeout(() => verify(), 2000);
                return;
            }

            setIsLoading(false);
            setTimeout(() => navigate('/'), 3000);
        };

        verify();
    }, []);

    return (
        <div className="p-4 text-center">
            <h1 className="text-xl font-bold">{message}</h1>
            {isLoading && <Spinner />}
        </div>
    );
};

export default VerifyEmailPage;
