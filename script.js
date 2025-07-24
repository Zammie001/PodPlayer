const defaultFeeds = [
  { name: "Ranger Bill", url: "https://fourble.co.uk/rangerbillsi-250723-7.rss" },
  { name: "Lamplighter Theatre", url: "https://www.oneplace.com/ministries/lamplighter-theatre/rss.html" },
  { name: "Kids Corner (Liz & Friends)", url: "https://kidscorner.net/feed/podcast" },
  { name: "VeggieTales Silly Stories", url: "https://rss.art19.com/veggietales-very-veggie-silly-stories" },
  { name: "Discovery Mountain", url: "https://www.spreaker.com/show/2408141/episodes/feed" }
];

function loadFeedList() {
  const savedFeeds = JSON.parse(localStorage.getItem("customFeeds") || "[]");
  const allFeeds = [...defaultFeeds, ...savedFeeds];
  const select = document.getElementById("feedSelect");
  select.innerHTML = '';
  allFeeds.forEach(feed => {
    const option = document.createElement("option");
    option.value = feed.url;
    option.textContent = feed.name;
    select.appendChild(option);
  });
}

function addCustomFeed() {
  const url = document.getElementById("customFeed").value.trim();
  if (!url) return alert("Please enter a URL.");
  const name = prompt("Enter a name for this feed:");
  if (!name) return;
  const saved = JSON.parse(localStorage.getItem("customFeeds") || "[]");
  saved.push({ name, url });
  localStorage.setItem("customFeeds", JSON.stringify(saved));
  loadFeedList();
  document.getElementById("customFeed").value = '';
}

async function loadEpisodes(order = 'newest') {
  const feedUrl = document.getElementById('feedSelect').value;
  const proxy = 'https://api.allorigins.win/get?url=';
  const response = await fetch(proxy + encodeURIComponent(feedUrl));
  const data = await response.json();
  console.log("RAW Feed Content:", data.contents);
  const parser = new DOMParser();
let xml;

try {
  const contents = data.contents;
  let decoded;

  if (contents.startsWith('data:')) {
    // data URI: try to decode Base64
    const base64 = contents.split(',')[1];
    decoded = atob(base64);
  } else if (/^[A-Za-z0-9+/=]+\s*$/.test(contents.slice(0, 100))) {
    // plain Base64 string (not a data URI), try decoding
    decoded = atob(contents);
  } else {
    // assume plain XML
    decoded = contents;
  }

  xml = parser.parseFromString(decoded, 'text/xml');
} catch (e) {
  console.error("Failed to decode feed:", e);
  return alert("This feed could not be loaded.");
}
  
  let items = Array.from(xml.querySelectorAll('item')).map(item => ({
    title: item.querySelector('title')?.textContent || 'Untitled',
    audio: item.querySelector('enclosure')?.getAttribute('url'),
    description: item.querySelector('description')?.textContent || '',
    pubDate: new Date(item.querySelector('pubDate')?.textContent || 0)
  }));

  items.sort((a, b) => order === 'newest' ? b.pubDate - a.pubDate : a.pubDate - b.pubDate);

  const episodesDiv = document.getElementById('episodes');
  episodesDiv.innerHTML = '';

  items.forEach(item => {
    if (item.audio) {
      const div = document.createElement('div');
      div.className = 'episode';
div.innerHTML = `
  <strong>${item.title}</strong><br>
  <small>${item.pubDate.toDateString()}</small><br>
  <audio controls src="${item.audio}"></audio>
`;
episodesDiv.appendChild(div); // ✅ append first

const audio = div.querySelector('audio'); // ✅ now it exists
if (audio) {
  audio.addEventListener('play', () => {
    currentAudio = audio;
  });
}

let currentAudio = null;

window.addEventListener('keydown', (e) => {
  if (!currentAudio) return;
  if (e.key === 'ArrowUp') {
    currentAudio.volume = Math.min(1, currentAudio.volume + 0.1);
  } else if (e.key === 'ArrowDown') {
    currentAudio.volume = Math.max(0, currentAudio.volume - 0.1);
  }
});

loadFeedList();
loadEpisodes();
