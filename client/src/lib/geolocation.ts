// Real current location, replacing the fixed Madrid origin. Falls back to
// the caller-supplied default if the browser has no geolocation support or
// the user denies the permission prompt — Velora still works either way.
export function getCurrentLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not available in this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve([position.coords.longitude, position.coords.latitude]),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  });
}
