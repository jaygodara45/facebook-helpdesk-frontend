import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1E4D91] relative">
      <div className="absolute top-4 right-4 my-3">
        <Link 
          href="/login" 
          className="mx-5 border-2 border-white text-white px-8 py-2 rounded-lg hover:bg-white hover:text-[#1b0d6b] transition-all text-xl"
        >
          Login
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-6xl font-bold mb-4 text-white">
          Welcome to
        </h1>
        <h1 className="text-7xl font-extrabold mb-8 bg-gradient-to-r from-gray-100 to-yellow-300 text-transparent bg-clip-text">
          Facebook Helpdesk
        </h1>
        <p className="text-xl mb-8 text-white">Your one-stop solution for business management</p>
      </div>
    </main>
  );
}
