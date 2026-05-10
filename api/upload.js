import FormData from "form-data";

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

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: "File kosong / tidak terbaca" });
    }

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: "upload.jpg",
      contentType: "image/jpeg",
    });

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    const text = await response.text();

    console.log("CATBOX RESPONSE:", text);

    if (!text.startsWith("http")) {
      return res.status(500).json({ error: text });
    }

    res.status(200).json({ url: text });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
