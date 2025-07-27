// 🔗 Default podcast feeds
const defaultFeeds = [
  { name: "Ranger Bill", url: "https://feeds.castos.com/d2r89" },
  { name: "Lamplighter Kids Stories", url: "https://anchor.fm/s/f4efe1c/podcast/rss" },
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

  // Auto-load the first feed
  if (select.options.length > 0) {
    select.value = select.options[0].value;
    loadEpisodes();
  }
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

async function loadEpisodes() {
  const feedUrl = document.getElementById('feedSelect').value;
  const sortOrder = document.getElementById('sortOrder').value;
  const proxy = "https://corsproxy.io/?";

  try {
    const response = await fetch(proxy + encodeURIComponent(feedUrl));
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");

    // 🔍 Get podcast image
    let imageUrl = null;
    const itunesImage = xml.querySelector("itunes\\:image");
    if (itunesImage) {
      imageUrl = itunesImage.getAttribute("href");
    } else {
      const imageTag = xml.querySelector("image url");
      if (imageTag) imageUrl = imageTag.textContent;
    }

    // 🔁 Remove old image if exists
    const oldImg = document.getElementById("podcastImage");
    if (oldImg) oldImg.remove();

    // 🎨 Show new image
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = "Podcast Cover";
      img.id = "podcastImage";
      img.style.width = "100%";
      img.style.borderRadius = "1em";
      img.style.marginBottom = "1em";
      const container = document.getElementById("episodes");
      container.parentNode.insertBefore(img, container);
    }

    // 🧾 Parse episodes
    let items = Array.from(xml.querySelectorAll("item")).map(item => ({
      title: item.querySelector("title")?.textContent || "Untitled",
      audio: item.querySelector("enclosure")?.getAttribute("url"),
      pubDate: new Date(item.querySelector("pubDate")?.textContent || 0),
      description: item.querySelector("description")?.textContent || ""
    }));

    items.sort((a, b) => {
      return sortOrder === "oldest" ? a.pubDate - b.pubDate : b.pubDate - a.pubDate;
    });

    const episodesDiv = document.getElementById("episodes");
    episodesDiv.innerHTML = "";

    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "episode";

      const title = document.createElement("div");
      title.textContent = item.title;

      const desc = document.createElement("div");
      desc.innerHTML = item.description;

      const link = document.createElement("a");
      link.href = item.audio;
      link.textContent = "Download mp3";
      link.setAttribute("target", "_blank");

      div.appendChild(title);
      div.appendChild(desc);
      div.appendChild(link);
      episodesDiv.appendChild(div);
    });

  } catch (e) {
    alert("Failed to load feed: " + e.message);
  }
}

// ⏫ Set up event listeners
document.getElementById("sortOrder").addEventListener("change", () => loadEpisodes());
document.getElementById("feedSelect").addEventListener("change", () => loadEpisodes());

// 🚀 Init on load
loadFeedList();
