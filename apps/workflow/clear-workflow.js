// Temporary script to clear workflow data
// Run this in browser console on localhost:3010/workspace

if (typeof window !== 'undefined') {
  // Clear IndexedDB
  indexedDB.deleteDatabase('firebaseLocalStorageDb');

  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('firebase') || key.includes('workflow')) {
      localStorage.removeItem(key);
    }
  });

  console.log('✅ Cleared workflow cache. Please refresh the page.');
}
