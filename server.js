const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

const SOURCES = [
"https://www.indiepornrevolution.com/indie-porn/wp-content/uploads/", "https://porncorporation.com/42/",
			"https://www.porncucumber.com/videos/", "https://www.homemadexxxporn.com/contents/videos/0/"
];

async function scrape(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const results = [];

  $("a[href]").each((i, el) => {
    const href = $(el).attr("href");

    if (!href || !href.toLowerCase().endsWith(".mp4")) {
      return;
    }

    results.push({
      title: href.split("/").pop().replace(".mp4", ""),
      videoUrl: href.startsWith("http")
        ? href
        : new URL(href, url).href,
      thumbnailUrl: "",
      description: ""
    });
  });

  return results;
}

app.get("/content", async (req, res) => {
  try {
    let content = [];

    for (const source of SOURCES) {
      const data = await scrape(source);
      content.push(...data);
    }

    res.json({
      content,
      totalElements: content.length,
      page: 0,
      size: content.length,
      totalPages: 1
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
