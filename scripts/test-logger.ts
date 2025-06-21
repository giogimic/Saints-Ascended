// scripts/test-logger.ts
// ESM/TypeScript: After building with `npm run build`, run this test with:
//    node dist/scripts/test-logger.js
// Logger import uses .js extension for ESM compatibility.
import { info, warn, error, debug } from '../lib/logger.js';

console.log('Testing logger functionality...\n');

// Test different log levels
info('[TEST]', 'This is an info message');
warn('[TEST]', 'This is a warning message');
error('[TEST]', 'This is an error message');
debug('[TEST]', 'This is a debug message');

// Test with objects
info('[TEST]', 'Object test: ' + JSON.stringify({ test: 'value', number: 123 }));

// Test error handling
try {
  throw new Error('Test error');
} catch (err) {
  error('[TEST]', 'Caught error: ' + (err instanceof Error ? err.message : String(err)));
}

console.log('\n✅ Logger test completed!'); 