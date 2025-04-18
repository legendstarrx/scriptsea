export default function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
        <p className="text-gray-600">Please wait while we load your content.</p>
      </div>
    </div>
  );
} 