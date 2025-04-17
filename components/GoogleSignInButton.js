import Image from 'next/image';

export default function GoogleSignInButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-gray-600 transition-colors duration-300 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none"
    >
      <Image
        src="/google.svg"
        alt="Google Logo"
        width={20}
        height={20}
      />
      <span>Continue with Google</span>
    </button>
  );
} 