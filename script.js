const defaultFeeds = [
  { name: "Ranger Bill", url: "https://feeds.castos.com/d2r89" },
  { name: "Lamplighter Theatre", url: "https://feed.justcast.com/shows/lamplighter-theatre-official/audioposts.rss" },
  { name: "Kids Corner (Liz & Friends)", url: "https://kidscorner.net/feed/podcast" },
  { name: "VeggieTales Silly Stories", url: "https://rss.art19.com/veggietales-very-veggie-silly-stories" },
  { name: "Discovery Mountain", url: "https://www.spreaker.com/show/2408141/episodes/feed" }
];

let currentAudio = null;

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
  const proxy = 'https://corsproxy.io/?';
  const response = await fetch(proxy + encodeURIComponent(feedUrl));
  const contents = await response.text(); // not response.json()

  const parser = new DOMParser();
  let xml;
  try {
    xml = parser.parseFromString(contents, 'text/xml');
  } catch (e) {
    console.error("Failed to parse feed:", e);
    return alert("Failed to load feed.");
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
    if (!item.audio) return;
    const div = document.createElement('div');
    div.className = 'episode';
    const safeTitle = item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 50);
div.innerHTML = `
  <strong>${item.title}</strong><br>
  <small>${item.pubDate.toDateString()}</small><br>
  <audio controls src="${item.audio}"></audio><br>
  <a href="${item.audio}" download="${safeTitle}.mp3">Download MP3</a>
`;
    episodesDiv.appendChild(div);

    const audio = div.querySelector('audio');
    if (audio) {
      audio.addEventListener('play', () => {
        currentAudio = audio;
      });
    }
  });
}

loadFeedList();
loadEpisodes();
document.getElementById('feedSelect').addEventListener('change', () => loadEpisodes());
