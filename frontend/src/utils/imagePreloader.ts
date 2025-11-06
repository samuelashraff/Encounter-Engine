const loaded = new Set<string>();

export function preloadImages(urls: string[]): Promise<void[]> {
  const promises = urls.map((url) => {
    if (!url) return Promise.resolve();
    if (loaded.has(url)) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        loaded.add(url);
        resolve();
      };
      img.onerror = () => {
        // on error we still resolve so the app continues
        loaded.add(url);
        resolve();
      };
      img.src = url;
    });
  });

  return Promise.all(promises);
}

export function isPreloaded(url: string) {
  return loaded.has(url);
}
