import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function OTPVerification() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const role = searchParams.get('role') || 'volunteer';
    const navigate = useNavigate();
    const { login } = useAuth();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const enteredOTP = otp.join('');

        if (enteredOTP.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`http://${window.location.hostname}:3000/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: enteredOTP }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success: In a real app we would save data.token to localStorage/Context
                login(data.user, data.token);
                // Automatically route to their respective dashboard on success
                navigate(`/${data.user?.role || role}/dashboard`);
            } else {
                setError(data.message || 'Invalid OTP code. Please try again.');
            }
        } catch (err) {
            setError('Server error. Ensure the backend is running on port 3000.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && e.currentTarget.previousSibling) {
                (e.currentTarget.previousSibling as HTMLInputElement).focus();
            }
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Session</h2>
                    <p className="text-gray-500 mb-6">No email was provided to verify.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-20 object-cover"></div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Verify Email</h2>
                        <p className="text-gray-500">
                            We sent a 6-digit code to <br />
                            <span className="font-semibold text-violet-600">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify}>
                        <div className="flex justify-center gap-2 sm:gap-4 mb-8">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                        type="text"
                                        name="otp"
                                        maxLength={1}
                                        key={index}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        autoFocus={index === 0}
                                    />
                                );
                            })}
                        </div>

                        {error && (
                            <p className="text-red-500 text-center text-sm mb-4 bg-red-50 py-2 rounded-lg font-medium">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || otp.join('').length !== 6}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-[1.25rem] shadow-sm text-lg font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Verify Account
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Didn't receive the code?{' '}
                        <button className="text-violet-600 font-semibold hover:text-violet-700 underline underline-offset-4">
                            Resend OTP
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
