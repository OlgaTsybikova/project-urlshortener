require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const { MongoClient } = require("mongodb");
// Basic Configuration
const port = process.env.PORT || 3000;
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("boilerplate");
const urls = db.collection("urls");

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  console.log(req.body);
  const url = req.body.url;
  const dnsLookUp = dns.lookup(new URL(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url: url,
        short_url: urlCount,
      };
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({ original_url: url, short_url: urlCount });
    }
  });
});
app.get("/api/shorturl/:short_url", async (req, res) => {
  const shortUrl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shortUrl });
  res.redirect(urlDoc.url);
});
