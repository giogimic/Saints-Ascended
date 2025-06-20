import { NextPageContext } from 'next';
import Link from 'next/link';
import { ExclamationTriangleIcon, HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun: _hasGetInitialPropsRun, err }: ErrorProps) {
  const isClientSideError = statusCode === undefined;
  const isServerSideError = statusCode !== undefined && statusCode >= 500;

  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col justify-center py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Error Icon */}
        <div className="flex justify-center mb-12">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-error/20 rounded-2xl flex items-center justify-center ring-2 ring-error/30 shadow-glow shadow-error/20">
            <ExclamationTriangleIcon className="h-12 w-12 sm:h-16 sm:w-16 text-error drop-shadow-glow" />
          </div>
        </div>
        
        <div className="text-center space-y-8">
          {/* Error Header */}
          <div>
            <h1 className="text-5xl sm:text-6xl font-bold text-error mb-4 font-display tracking-wide">
              {statusCode || 'Error'}
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-base-content mb-4">
              {getErrorMessage(statusCode, isClientSideError)}
            </h2>
            <p className="text-lg text-base-content/70 font-mono max-w-md mx-auto">
              {getErrorDescription(statusCode, isClientSideError, isServerSideError)}
            </p>
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && err && (
            <div className="card bg-base-200 shadow-xl border border-error/20 rounded-2xl">
              <div className="card-body p-6">
                <h3 className="text-lg font-semibold text-error mb-4">
                  Development Error Details:
                </h3>
                <div className="bg-base-300 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-sm text-error/80 whitespace-pre-wrap font-mono">
                    {err.stack || err.message}
                  </pre>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="btn btn-primary btn-lg rounded-xl shadow-lg hover:shadow-glow hover:shadow-primary/30 transition-all duration-300 font-semibold tracking-wide"
            >
              <HomeIcon className="h-5 w-5" />
              Back to Dashboard
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline btn-lg rounded-xl hover:bg-secondary hover:border-secondary hover:text-secondary-content transition-all duration-300 font-semibold tracking-wide"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Try Again
            </button>
          </div>

          {/* Error Type Indicator */}
          <div className="card bg-base-200 shadow-xl border border-base-300 rounded-2xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-center gap-4">
                <div className={`badge badge-lg gap-2 ${
                  isClientSideError ? 'badge-warning' : 
                  isServerSideError ? 'badge-error' : 'badge-info'
                }`}>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  {isClientSideError ? 'Client Error' : 
                   isServerSideError ? 'Server Error' : 'Request Error'}
                </div>
                <span className="text-base-content/60 font-mono">
                  Status: {statusCode || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-16 text-center">
        <div className="card bg-base-200 shadow-xl border border-base-300 rounded-2xl">
          <div className="card-body p-4">
            <p className="text-sm text-base-content/60 font-mono">
              Ark Server Manager - Error Handler
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(statusCode?: number, isClientSideError?: boolean): string {
  if (isClientSideError) {
    return 'Client-side Error';
  }
  
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Page Not Found';
    case 500:
      return 'Internal Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return 'An Error Occurred';
  }
}

function getErrorDescription(
  statusCode?: number, 
  isClientSideError?: boolean, 
  isServerSideError?: boolean
): string {
  if (isClientSideError) {
    return 'An unexpected error occurred in your browser. Please try refreshing the page.';
  }
  
  if (isServerSideError) {
    return 'A server error occurred. Our team has been notified and is working to fix the issue.';
  }
  
  switch (statusCode) {
    case 400:
      return 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'You need to be authenticated to access this resource.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The page you are looking for could not be found.';
    default:
      return 'Something went wrong. Please try again or contact support if the problem persists.';
  }
}

Error.getInitialProps = async ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;
  return { statusCode };
};

export default Error; 