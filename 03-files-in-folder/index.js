const path = require("path");
const fs = require("fs");

async function read() {
  const files = await fs.promises.readdir(
    path.join(__dirname, "secret-folder"),
    { withFileTypes: true }
  );
  for (const file of files) {
    if (!file.isDirectory()) {
      fs.stat(
        path.join(__dirname, "secret-folder", `${file.name}`),
        (_, stat) => {
          console.log(
            `${file.name.substring(0, file.name.lastIndexOf("."))} - ${path
              .extname(file.name)
              .slice(1)} - ${stat.size / 1024}kb`
          );
        }
      );
    }
  }
}
read();
