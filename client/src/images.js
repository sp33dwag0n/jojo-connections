// Character images are public Vercel Blob URLs. Each upload gets a unique URL, so the
// browser's HTTP cache (plus Vercel's CDN) can keep them for a long time: preloading
// downloads them once and later page loads read them from the browser cache.

// url -> Promise<HTMLImageElement | null> (null if the image failed to load)
const preloaded = new Map();

// Starts downloading and decoding an image (once per session) so it's ready to display
export function preloadImage(url) {
  if (!url) return Promise.resolve(null);

  let promise = preloaded.get(url);
  if (!promise) {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    promise = img.decode().then(
      () => img,
      () => {
        preloaded.delete(url); // allow a retry next time instead of caching the failure
        return null;
      },
    );
    preloaded.set(url, promise);
  }
  return promise;
}

// Preloads every image in the list, skipping empty values and duplicates
export function preloadImages(urls) {
  return Promise.all([...new Set(urls.filter(Boolean))].map(preloadImage));
}
