let timer;
let searchTerm = '';

const updateLyrics = async ({ search, url }) => {
  try {
    document.querySelector('main').innerHTML = `<div data-loading></div>`;

    const { lyrics, title, artist, genius } = await fetch(
      `/.netlify/functions/lyrics?${url ? `url=${url}` : `song=${search}`}`
    ).then((response) => response.json());

    if (lyrics) {
      document.querySelector('main').setAttribute('data-loaded', true);
      document.querySelector('main').innerHTML = `
        <div data-lyricsHeader>
          <h2>
            <div data-trackName>${title}</div>
            ${artist && `<div data-artistName>${artist}</div>`}
          </h2>
          <a href='${genius}'>${geniusSvg} Genius</a>
        </div>
        <div data-lyrics>${lyrics}</div>
      `;

      document.querySelector('[data-guide]')?.remove();
    } else {
      throw new Error('🤷');
    }
  } catch (e) {
    console.log(`Unable to fetch lyrics: ${e}`);
    document.querySelector('main').removeAttribute('data-loaded');
    document.querySelector('main').innerHTML = `<div data-error>sigh... something went wrong 😔</div>`;
  }
};

// fetch new lyrics when search input changes (debounced)
document.querySelector('input').addEventListener('input', ({ target: { value } }) => {
  searchTerm = value;
  if (value.length > 3) {
    if (!document.querySelector('[data-loading]')) {
      document.querySelector('main').innerHTML = `<div data-loading></div>`;
    }
    debounce(() => updateLyrics({ search: value }));
  }
});

// immediately fetch lyrics when Enter pressed
document.querySelector('input').addEventListener('keydown', ({ key }) => {
  if (key === 'Enter') {
    clearTimeout(timer);
    updateLyrics({ search: searchTerm });
  }
});

// process WebShareTarget
window.addEventListener('DOMContentLoaded', async () => {
  const parsedUrl = new URL(window.location);
  const url = parsedUrl.searchParams.get('url');
  const text = parsedUrl.searchParams.get('text');

  const validURL = isURL(url) ? url : isURL(text) ? text : findUrlFromText(text) ?? '';

  if (validURL) {
    await updateLyrics({ url: encodeURIComponent(validURL) });
  }
});

const findUrlFromText = (text) => /(https?:\/\/[^\s]+)/g.exec(text)?.[0];

const isURL = (str) => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'spotify';
  } catch (_) {
    return false;
  }
};

const geniusSvg = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1500"><path d="M380.3 392.2c-113.6 103.9-129.4 287.7-35.5 411.3 26.6 34.9 75.2 77.5 85.6 74.9 8-2 8.9-6.9 3.8-22.3-37.8-115.3-12-236.6 69.7-327.9L514 517V393.8l-2.9-2.9-2.9-2.9H385l-4.7 4.2zm376.2-3.3c-6.3 2.6-5.9-1.9-6.6 76-.5 68-.6 70.9-2.7 78.7-13 49.2-50.3 83-99 89.8-15 2.1-17.1 5.3-14.2 22.1 17.3 100.1 148.9 132.4 209.9 51.4 22-29.1 25.1-43.6 25.1-115.7 0-57.1-3.1-50.5 24.3-51.2 30.8-.7 31.1-1.6 17.5-44-12.6-39.3-46.6-99.7-59.9-106.6-3.1-1.6-90.5-2-94.4-.5z"/><path d="M1103.8 397c-4 4-3.7 5.8 4.2 28 39.2 110.7 40.1 237.4 2.3 349.8-96.2 286.8-413.5 439.7-696.3 335.7-13.7-5-17.5-5.5-21.3-2.5-8.4 6.7-1.7 15.5 33.8 43.9 226.1 180.9 557.7 137.9 731.5-94.9 141.9-190.1 133.7-455.8-19.5-636.5-23.8-28.1-27.6-30.6-34.7-23.5z"/></svg>`;

const debounce = (func, delay = 300) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce')) {
    delay *= 4;
  }
  clearTimeout(timer);
  timer = setTimeout(func, delay);
};
