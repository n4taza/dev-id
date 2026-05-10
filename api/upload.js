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
    const form = new formidable.IncomingForm({
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("FORM ERROR:", err);
        return res.status(500).json({ error: "Form parse error" });
      }

      const file = files.file;

      if (!file) {
        return res.status(400).json({ error: "File tidak ditemukan" });
      }

      // 🔥 ambil path file temp dari Vercel
      const fileStream = fs.createReadStream(file.filepath);

      const formData = new FormData();

      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", fileStream);

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await response.text();

      console.log("CATBOX RESPONSE:", text);

      if (!text.startsWith("http")) {
        return res.status(500).json({ error: text });
      }

      res.status(200).json({ url: text });
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
