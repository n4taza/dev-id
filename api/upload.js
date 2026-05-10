import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    const form = formidable({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Parse error" });
      }

      const file = files.file;

      if (!file) {
        return res.status(400).json({ error: "File tidak ditemukan" });
      }

      // ⚠️ beda versi formidable, kadang array
      const filepath = Array.isArray(file)
        ? file[0].filepath
        : file.filepath;

      const stream = fs.createReadStream(filepath);

      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", stream);

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await response.text();

      console.log("CATBOX:", text);

      if (!text.startsWith("http")) {
        return res.status(500).json({ error: text });
      }

      res.status(200).json({ url: text });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
