const url = 'https://staging.apis.getlit.dev/datil-dev/contracts';
const numberOfRequests = 100;

async function testRateLimit() {
  for (let i = 0; i < numberOfRequests; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.log(`Request ${i + 1}: Status ${response.status} - ${response.statusText}`);
      } else {
        console.log(`Request ${i + 1}: Status ${response.status} - Success`);
      }
    } catch (error) {
      console.log(`Request ${i + 1}: Error - ${error}`);
    }
  }
}

testRateLimit();

// Results:
// Request 60: Status 200 - Success
// Request 61: Status 200 - Success
// Request 62: Status 200 - Success
// Request 63: Status 200 - Success
// Request 64: Status 200 - Success
// Request 65: Status 200 - Success
// Request 66: Status 200 - Success
// Request 67: Status 429 - Too Many Requests
// Request 68: Status 200 - Success
// Request 69: Status 200 - Success
// Request 70: Status 429 - Too Many Requests
// Request 71: Status 200 - Success
// Request 72: Status 200 - Success
// Request 73: Status 200 - Success
// Request 74: Status 200 - Success
// Request 75: Status 200 - Success
// Request 76: Status 200 - Success
// Request 77: Status 429 - Too Many Requests
// Request 78: Status 200 - Success
// Request 79: Status 429 - Too Many Requests
// Request 80: Status 200 - Success
// Request 81: Status 200 - Success
// Request 82: Status 200 - Success
// Request 83: Status 429 - Too Many Requests
// Request 84: Status 429 - Too Many Requests
// Request 85: Status 200 - Success
// Request 86: Status 200 - Success
// Request 87: Status 200 - Success
// Request 88: Status 200 - Success
// Request 89: Status 429 - Too Many Requests
// Request 90: Status 200 - Success
// Request 91: Status 200 - Success
// Request 92: Status 200 - Success
// Request 93: Status 200 - Success
// Request 94: Status 429 - Too Many Requests
// Request 95: Status 429 - Too Many Requests
