const express = require("express");
const cors = require("cors");
const path = require("path");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/generate", async (req, res) => {

  try {

    const prompt = req.body.prompt;

    if (!prompt) {

      return res.json({
        result: "No prompt provided"
      });

    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-small",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          inputs: prompt
        })

      }
    );

    const text = await response.text();

    console.log(text);

    let data;

    try {

      data = JSON.parse(text);

    } catch {

      return res.json({
        result: text
      });

    }

    if (Array.isArray(data)) {

      return res.json({
        result:
          data[0]?.generated_text ||
          "No generated text"
      });

    }

    if (data.error) {

      return res.json({
        result:
          "AI Error: " + data.error
      });

    }

    return res.json({
      result:
        JSON.stringify(data)
    });

  } catch (err) {

    return res.json({
      result:
        "Server Error: " + err.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "PHANTOMFORGE running on port",
    PORT
  );

});
