import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 py-7 bg-gray-800 text-white shadow-md">
      <div className="text-xl  font-bold">
        Pumping Lemma Visualizer
      </div>
      <div className="flex px-5 gap-15">
        <Link href="/" className="hover:text-blue-400 hover:font-bold transition-colors">
          Home
        </Link>
        <Link href="/visualize" className="hover:text-blue-400 hover:font-bold transition-colors">
          Visualize
        </Link>
      </div>
    </nav>
  );
}