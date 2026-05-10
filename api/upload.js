export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: req.headers,
      body: req
    });

    const text = await response.text();

    res.status(200).send(text);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
