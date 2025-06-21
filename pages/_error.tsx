import { NextPageContext } from 'next';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  const isClientSideError = !statusCode;
  const isServerSideError = !!statusCode && statusCode !== 404;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4">
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* Error Icon */}
        <div className="text-6xl text-destructive animate-pulse">
          ⚠️
        </div>

        {/* Error Title */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2 font-display tracking-wide">
            {statusCode || 'CLIENT ERROR'}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
            {getErrorTitle(statusCode)}
          </h2>
          <p className="text-lg text-muted-foreground font-mono max-w-md mx-auto">
            {getErrorMessage(statusCode)}
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="bg-card shadow-xl border border-destructive/20 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Error Details</h3>
            <div className="bg-muted rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-muted-foreground">
                {err?.stack || `HTTP ${statusCode || 'CLIENT'} Error`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 font-semibold tracking-wide"
            size="lg"
          >
            🔄 Reload Page
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-secondary hover:bg-secondary hover:border-secondary hover:text-secondary-foreground transition-all duration-300 font-semibold tracking-wide rounded-xl"
            size="lg"
          >
            ← Go Back
          </Button>
        </div>

        {/* Error Type Badge */}
        <Card className="bg-card shadow-xl border border-border rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Error Classification</h3>
            <Badge
              variant={isClientSideError ? "secondary" : isServerSideError ? "destructive" : "default"}
              className="gap-2 px-4 py-2 text-base"
            >
              {isClientSideError ? '🔧' : isServerSideError ? '🛠️' : 'ℹ️'}
              <span className="capitalize">
                {isClientSideError ? 'Client Error' :
                 isServerSideError ? 'Server Error' : 'Application Error'}
              </span>
            </Badge>
            <p className="text-sm text-muted-foreground mt-4">
              {isClientSideError
                ? 'This error occurred in your browser. Try refreshing the page.'
                : isServerSideError
                ? 'This error occurred on our servers. Our team has been notified.'
                : 'An unexpected error occurred. Please try again.'}
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-card shadow-xl border border-border rounded-2xl">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground font-mono">
              Error Code: {statusCode || 'UNKNOWN'} | Timestamp: {new Date().toISOString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

function getErrorTitle(statusCode?: number): string {
  switch (statusCode) {
    case 404:
      return 'Page Not Found';
    case 500:
      return 'Internal Server Error';
    case 403:
      return 'Access Forbidden';
    case 401:
      return 'Unauthorized';
    case 400:
      return 'Bad Request';
    case 503:
      return 'Service Unavailable';
    case 502:
      return 'Bad Gateway';
    default:
      return 'Something went wrong';
  }
}

function getErrorMessage(statusCode?: number): string {
  switch (statusCode) {
    case 404:
      return 'The page you are looking for could not be found.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 401:
      return 'You must be logged in to access this resource.';
    case 400:
      return 'The request was invalid. Please check your input and try again.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    case 502:
      return 'Bad gateway error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export default Error; 