const express = require("express");
const cors = require("cors");
const path = require("path");

// safer fetch import for Node
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// AI route
app.post("/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.json({ result: "No prompt provided" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `User: ${prompt}\nAssistant:`
        })
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({
        result: text
      });
    }

    let result = "";

    if (Array.isArray(data)) {
      result = data[0]?.generated_text || "No output generated";
    } else if (data?.generated_text) {
      result = data.generated_text;
    } else if (data?.error) {
      result = "AI Error: " + data.error;
    } else {
      result = JSON.stringify(data);
    }

    res.json({ result });

  } catch (err) {
    res.json({
      result: "Server error: " + err.message
    });
  }
});

// Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("PHANTOMFORGE running on port", PORT);
});