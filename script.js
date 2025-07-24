
const defaultFeeds = [
  { name: "Ranger Bill", url: "https://fourble.co.uk/rangerbillsi-250723-7.rss" },
  { name: "Lamplighter Theatre", url: "https://lamplightertheatre.libsyn.com/rss" },
  { name: "Kids Corner (Liz & Friends)", url: "https://kidscorner.reframemedia.com/liz-and-friends-podcast.xml" },
  { name: "VeggieTales", url: "https://www.vegetales.com/rss" },
  { name: "Discovery Mountain", url: "https://discoverymountain.com/podcast/rss" }
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
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, 'text/xml');

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
      episodesDiv.appendChild(div);
    }
  });
}

loadFeedList();
loadEpisodes();
