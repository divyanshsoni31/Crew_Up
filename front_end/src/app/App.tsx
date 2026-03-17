import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  return (
    <GoogleOAuthProvider clientId="762860863593-9ekjs27vhs9rrbfu76ndr7n3jvstjet3.apps.googleusercontent.com">
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}