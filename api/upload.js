import formidable from "formidable";
import { Catbox } from "node-catbox"; // 🔥 pakai ini (lebih baru)

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
        return res.status(500).json({ error: "Parse error" });
      }

      const file = files.file;

      if (!file) {
        return res.status(400).json({ error: "File tidak ditemukan" });
      }

      const filepath = Array.isArray(file)
        ? file[0].filepath
        : file.filepath;

      const catbox = new Catbox();

      // 🔥 ini sesuai dokumentasi
      const url = await catbox.uploadFile({
        path: filepath,
      });

      res.status(200).json({ url });

    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
