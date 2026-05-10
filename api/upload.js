export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    const text = await response.text();

    return res.status(200).json({ result: text });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
