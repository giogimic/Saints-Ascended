/**
 * Recursively converts BigInt values to strings in an object.
 * This is necessary because JSON.stringify() cannot handle BigInts.
 * @param obj The object to process.
 * @returns A new object with BigInts converted to strings.
 */
export function convertBigIntsToStrings(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (typeof obj.toJSON === 'function') {
      // If the object has a toJSON method, it knows how to serialize itself.
      // This is a common pattern for Date objects, etc.
      return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntsToStrings);
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'bigint') {
        newObj[key] = value.toString();
      } else if (typeof value === 'object') {
        newObj[key] = convertBigIntsToStrings(value);
      } else {
        newObj[key] = value;
      }
    }
  }

  return newObj;
} 