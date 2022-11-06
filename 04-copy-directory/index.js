const fs = require("fs");
const path = require("path");

async function copy() {
  await fs.promises.mkdir(path.join(__dirname, "files-copy"), {
    recursive: true,
  });

  const files = await fs.promises.readdir(path.join(__dirname, "files"));
  const filesCopy = await fs.promises.readdir(
    path.join(__dirname, "files-copy")
  );

  for (const file of filesCopy) {
    fs.unlink(path.join(__dirname, "files-copy", `${file}`), (err) => {
      if (err) throw err;
    });
  }

  for (const file of files) {
    await fs.promises.copyFile(
      path.join(__dirname, "files", `${file}`),
      path.join(__dirname, "files-copy", `${file}`)
    );
  }
}

copy();
