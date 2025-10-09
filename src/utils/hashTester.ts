/**
 * Hash Tester Utility
 * Run this to verify password hashes
 */

export async function testPasswordHash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Auto-run on import to verify the hash
if (typeof window !== 'undefined') {
  testPasswordHash('preview2025').then(hash => {
    console.log('============ PASSWORD HASH VERIFICATION ============');
    console.log('Password: "preview2025"');
    console.log('Calculated Hash:', hash);
    console.log('===================================================');
  });
}
