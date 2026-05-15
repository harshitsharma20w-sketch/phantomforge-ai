const express = require("express");
const cors = require("cors");
const path = require("path");

// fetch support
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(__dirname));

// homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// AI route
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

    const data = await response.json();

    console.log(data);

    // successful AI response
    if (Array.isArray(data)) {

      return res.json({
        result:
          data[0]?.generated_text ||
          "No generated text"
      });

    }

    // AI error
    if (data.error) {

      return res.json({
        result:
          "AI Error: " + data.error
      });

    }

    // fallback
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

// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "PHANTOMFORGE running on port",
    PORT
  );

});
