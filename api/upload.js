import formidable from "formidable";
import { Catbox } from "node-catbox";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    console.log("REQ MASUK");

    const form = formidable({ keepExtensions: true });

    let responded = false;

    // ⏱️ anti stuck (timeout 8 detik)
    setTimeout(() => {
      if (!responded) {
        responded = true;
        res.status(500).json({ error: "Timeout parsing file" });
      }
    }, 8000);

    form.parse(req, async (err, fields, files) => {
      if (responded) return;

      if (err) {
        responded = true;
        console.error("FORM ERROR:", err);
        return res.status(500).json({ error: "Parse error" });
      }

      console.log("FILES:", files);

      const file = files.file;

      if (!file) {
        responded = true;
        return res.status(400).json({ error: "File tidak terbaca" });
      }

      const filepath = Array.isArray(file)
        ? file[0].filepath
        : file.filepath;

      console.log("FILEPATH:", filepath);

      const catbox = new Catbox();

      const url = await catbox.uploadFile({
        path: filepath,
      });

      console.log("SUCCESS:", url);

      responded = true;
      res.status(200).json({ url });
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}
