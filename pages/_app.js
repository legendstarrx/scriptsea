import { AuthProvider } from '../context/AuthContext';
import RootLayout from '../components/RootLayout';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </AuthProvider>
  );
}

export default MyApp; 