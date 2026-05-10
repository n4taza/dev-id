export const config = {
  api: {
    bodyParser: false
  }
};

import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Parse error" });

      const file = files.file;

      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", fs.createReadStream(file.filepath));

      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData
      });

      const text = await response.text();

      res.status(200).json({ url: text });
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Upload failed" });
  }
}
