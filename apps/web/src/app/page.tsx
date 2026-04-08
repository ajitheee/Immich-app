import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xl font-bold text-white">Immich Clone</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="btn-ghost">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Your Photos, Your Privacy
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8">
            A self-hosted photo and video backup solution. Keep your memories safe
            and private on your own server.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Start Free Trial
            </Link>
            <a href="#features" className="btn-outline text-lg px-8 py-3">
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="card">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Photo Backup</h3>
            <p className="text-dark-300">
              Automatically backup your photos and videos from any device.
              Support for RAW files and 4K video.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.181a8.007 8.007 0 011.485 5.963c.454.09.89.224 1.3.393.587.24 1.142.581 1.658.993A8 8 0 0118.657 18.657z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Face Recognition</h3>
            <p className="text-dark-300">
              Advanced AI automatically detects and groups faces.
              Find photos of friends and family instantly.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Smart Search</h3>
            <p className="text-dark-300">
              Search your photos by content, location, date, or people.
              Find any memory in seconds.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to take control of your photos?
            </h2>
            <p className="text-dark-300 mb-6">
              Join thousands of users who trust their memories to their own servers.
            </p>
            <Link href="/register" className="btn-primary">
              Create Free Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-dark-400">
          <p>&copy; {new Date().getFullYear()} Immich Clone. Open source photo backup.</p>
        </div>
      </footer>
    </div>
  );
}