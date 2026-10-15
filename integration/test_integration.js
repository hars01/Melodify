/**
 * Melodify Integration Test Suite
 * Validates backend API contracts, JWT cookie authentication, and music endpoints.
 */

const http = require('http');

const BACKEND_BASE = process.env.TEST_BACKEND_URL || 'http://localhost:3000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_BASE);
    const reqHeaders = {
      'Accept': 'application/json',
      ...headers,
    };

    let postData = null;
    if (body) {
      postData = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const cookieStr = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = cookieStr.match(/Token=([^;]+)/);
  return match ? `Token=${match[1]}` : null;
}

async function runTests() {
  console.log('====================================================');
  console.log('🎵 Melodify Integration Test Suite');
  console.log(`Target Backend: ${BACKEND_BASE}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Server Root Health Check
  try {
    const res = await request('GET', '/');
    if (res.statusCode === 200 && String(res.data).includes('Melodify Backend')) {
      console.log('✅ [PASS] 1. Backend root health check responded 200');
      passed++;
    } else {
      console.error('❌ [FAIL] 1. Root health check unexpected response:', res.statusCode, res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ [FAIL] 1. Could not connect to backend:', err.message);
    failed++;
  }

  // Test 2: Protected endpoint without auth must return 401
  try {
    const res = await request('GET', '/api/music');
    if (res.statusCode === 401) {
      console.log('✅ [PASS] 2. Unauthorized request to /api/music correctly returned 401');
      passed++;
    } else {
      console.error('❌ [FAIL] 2. Unauthorized request did not return 401. Status:', res.statusCode);
      failed++;
    }
  } catch (err) {
    console.error('❌ [FAIL] 2. Error testing unauthorized request:', err.message);
    failed++;
  }

  // Test 3: User Registration
  const testUsername = `user_${Date.now()}`;
  const testEmail = `${testUsername}@melodify.test`;
  const testPassword = 'Password123!';
  let authCookie = null;

  try {
    const res = await request('POST', '/api/auth/register', {
      username: testUsername,
      email: testEmail,
      password: testPassword,
      role: 'user',
    });

    if (res.statusCode === 201 && res.data.user) {
      authCookie = extractCookie(res.headers);
      console.log(`✅ [PASS] 3. Registration successful for "${testUsername}". Cookie extracted:`, !!authCookie);
      passed++;
    } else {
      console.error('❌ [FAIL] 3. Registration failed. Status:', res.statusCode, res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ [FAIL] 3. Error during registration test:', err.message);
    failed++;
  }

  // Test 4: User Login
  try {
    const res = await request('POST', '/api/auth/login', {
      username: testUsername,
      password: testPassword,
    });

    if (res.statusCode === 200 && res.data.user) {
      authCookie = extractCookie(res.headers) || authCookie;
      console.log(`✅ [PASS] 4. Login successful for "${testUsername}". Token cookie received.`);
      passed++;
    } else {
      console.error('❌ [FAIL] 4. Login failed. Status:', res.statusCode, res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ [FAIL] 4. Error during login test:', err.message);
    failed++;
  }

  // Test 5: Authenticated GET /api/music
  try {
    const res = await request('GET', '/api/music', null, {
      Cookie: authCookie,
    });

    if (res.statusCode === 200 && Array.isArray(res.data.musics)) {
      console.log(`✅ [PASS] 5. Authenticated /api/music returned 200 with ${res.data.musics.length} tracks.`);
      passed++;
    } else {
      console.error('❌ [FAIL] 5. /api/music failed with cookie. Status:', res.statusCode, res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ [FAIL] 5. Error calling authenticated /api/music:', err.message);
    failed++;
  }

  // Test 6: Authenticated GET /api/music/albums
  try {
    const res = await request('GET', '/api/music/albums', null, {
      Cookie: authCookie,
    });

    if (res.statusCode === 200) {
      const albumsCount = Array.isArray(res.data.musics) ? res.data.musics.length : 0;
      console.log(`✅ [PASS] 6. Authenticated /api/music/albums returned 200 with ${albumsCount} albums.`);
      passed++;
    } else {
      console.error('❌ [FAIL] 6. /api/music/albums failed. Status:', res.statusCode, res.data);
      failed++;
    }
  } catch (err) {
    console.error('❌ [FAIL] 6. Error calling /api/music/albums:', err.message);
    failed++;
  }

  // Test 7: User Logout
  try {
    const res = await request('POST', '/api/auth/logout', null, {
      Cookie: authCookie,
    });

    if (res.statusCode === 200) {
      console.log('✅ [PASS] 7. Logout responded 200 and cleared Token cookie.');
      passed++;
    } else {
      console.error('❌ [FAIL] 7. Logout failed. Status:', res.statusCode);
      failed++;
    }
  } catch (err) {
    console.error('❌ [FAIL] 7. Error calling logout:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed | ${failed} Failed`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
