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

    const fileBuffer = Buffer.concat(chunks);

    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";

    const body = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="reqtype"\r\n\r\n` +
        `fileupload\r\n`
      ),

      Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="fileToUpload"; filename="file.jpg"\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`
      ),

      fileBuffer,

      Buffer.from(`\r\n--${boundary}--`)
    ]);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: body,
    });

    const text = await response.text();

    console.log("CATBOX:", text);

    if (!text.startsWith("http")) {
      return res.status(500).json({ error: text });
    }

    res.status(200).json({ url: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
