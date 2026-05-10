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

    const form = new FormData();

    // ⚠️ append urutan penting (reqtype dulu)
    form.append("reqtype", "fileupload");

    form.append("fileToUpload", buffer, {
      filename: "file.jpg",
      contentType: "application/octet-stream",
    });

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: {
        ...form.getHeaders(), // ⬅️ WAJIB
      },
      body: form,
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
