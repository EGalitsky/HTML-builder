const fs = require("fs");
const path = require("path");

async function merge() {
  const files = await fs.promises.readdir(path.join(__dirname, "styles"), {
    withFileTypes: true,
  });

  fs.unlink(path.join(__dirname, "project-dist", "bundle.css"), (err) => {
    if (err && err.code !== "ENOENT") throw err;
    return;
  });

  for (const file of files) {
    if (file.isFile()) {
      if (path.extname(file.name) === ".css") {
        let text = "";
        const stream = fs.createReadStream(
          path.join(__dirname, "styles", `${file.name}`)
        );
        stream.on("data", (chunk) => (text += chunk));
        stream.on("end", () => {
          fs.appendFile(
            "05-merge-styles/project-dist/bundle.css",
            `${text}`,
            (err) => {
              if (err) throw err;
            }
          );
        });
      }
    }
  }
}
merge();
