import Image from 'next/image';

<button 
  onClick={handleGoogleSignIn} 
  className="flex items-center justify-center gap-2 w-full p-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
>
  <Image
    src="/google.svg"
    alt="Google"
    width={20}
    height={20}
    priority
  />
  Sign in with Google
</button> 