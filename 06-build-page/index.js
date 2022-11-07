const fs = require("fs");
const path = require("path");

async function deleteDir(folderPath) {
  try {
    const filesCopy = await fs.promises.readdir(
      folderPath,
      { withFileTypes: true },
      (err) => {
        if (err) throw err;
      }
    );
    for (const file of filesCopy) {
      if (file.isDirectory()) {
        await fs.promises.rmdir(folderPath, { recursive: true }, (err) => {
          if (err) {
            if (err.code === "ENOTEMPTY") {
              return deleteDir(path.join(folderPath, `${file.name}`));
            }
            throw err;
          }
        });
      }

      if (file.isFile()) {
        fs.unlink(path.join(folderPath, `${file.name}`), (err) => {
          if (err) {
            if (err.code === "ENOENT") {
              return;
            }
            throw err;
          }
        });
      }
    }
  } catch (err) {
    if (err) {
      if (err.code === "ENOENT") {
        return;
      }
      throw err;
    }
  }
}

async function createDir(dirPath) {
  try {
    await fs.promises.mkdir(dirPath, {
      recursive: true,
    });
  } catch (err) {
    if (err) {
      if (err.code === "ENOENT") {
        return;
      }
      throw err;
    }
  }
}

async function copyDir(currentPath, copyPath) {
  await fs.promises.mkdir(copyPath, {
    recursive: true,
  });

  const files = await fs.promises.readdir(currentPath, {
    withFileTypes: true,
  });

  for (const file of files) {
    if (file.isDirectory())
      copyDir(
        path.join(currentPath, file.name),
        path.join(copyPath, file.name)
      );
    if (file.isFile()) {
      await fs.promises.copyFile(
        path.join(currentPath, `${file.name}`),
        path.join(copyPath, `${file.name}`)
      );
    }
  }
}

async function readFile() {
  let html = "";
  const files = await fs.promises.readdir(path.join(__dirname, "components"));
  const stream = fs.createReadStream(path.join(__dirname, "template.html"));

  stream.on("data", (chunk) => (html += chunk));
  stream.on("end", () => {
    for (const file of files) {
      fs.readFile(
        path.join(__dirname, "components", `${file}`),
        "utf-8",
        (err, content) => {
          if (err) throw err;
          html = html.replace(
            `{{${file.substring(0, file.lastIndexOf("."))}}}`,
            content
          );
          fs.promises.writeFile(
            path.join(__dirname, "project-dist", "index.html"),
            html,
            (err) => {
              if (err) throw err;
            }
          );
        }
      );
    }
  });
}

async function merge() {
  const files = await fs.promises.readdir(path.join(__dirname, "styles"), {
    withFileTypes: true,
  });

  fs.unlink(path.join(__dirname, "project-dist", "style.css"), (err) => {
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
            "06-build-page/project-dist/style.css",
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

async function init() {
  await deleteDir(path.join(__dirname, "project-dist"));
  await createDir(path.join(__dirname, "project-dist"));
  await copyDir(
    path.join(__dirname, "assets"),
    path.join(__dirname, "project-dist", "assets")
  );
  await readFile();
  await merge();
}
init();
