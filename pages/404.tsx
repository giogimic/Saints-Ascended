import Link from 'next/link';
import { MagnifyingGlassIcon, ServerIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col justify-center py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* 404 Illustration */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="text-8xl sm:text-9xl font-bold text-base-300/30 select-none font-display tracking-wider">
              404
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/20 rounded-2xl flex items-center justify-center ring-2 ring-primary/30 shadow-glow shadow-primary/20">
                <ServerIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary drop-shadow-glow" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-primary mb-4 font-display tracking-wide">
              Page Not Found
            </h1>
            <p className="text-xl text-base-content/70 font-mono">
              Sorry, the page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>
          
          {/* Error Details */}
          <div className="card bg-base-200 shadow-xl border border-base-300 rounded-2xl">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-base-content mb-4">This might have happened because:</h3>
              <ul className="text-base-content/70 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-error rounded-full"></div>
                  <span>The server was removed or doesn&apos;t exist</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>You followed an outdated link</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-info rounded-full"></div>
                  <span>There was a typo in the URL</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-glow hover:shadow-primary/30 transition-all duration-300 font-semibold tracking-wide"
            >
              <HomeIcon className="h-5 w-5" />
              Go Back Home
            </Link>
            <button 
              onClick={() => router.back()} 
              className="btn btn-outline btn-lg rounded-xl hover:bg-secondary hover:border-secondary hover:text-secondary-content transition-all duration-300 font-semibold tracking-wide"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Go Back
            </button>
          </div>
          
          {/* Search Box */}
          <div className="max-w-md mx-auto">
            <div className="form-control">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search for a server..."
                  className="input input-bordered w-full pl-12 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const query = (e.target as HTMLInputElement).value;
                      if (query.trim()) {
                        window.location.href = `/?search=${encodeURIComponent(query)}`;
                      }
                    }
                  }}
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-base-content/50 font-mono">Press Enter to search</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center">
        <div className="card bg-base-200 shadow-xl border border-base-300 rounded-2xl">
          <div className="card-body p-4">
            <p className="text-sm text-base-content/60 font-mono">
              Ark Server Manager - Page Not Found
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 