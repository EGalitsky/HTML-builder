const fs = require("fs");
const path = require("path");

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
          if (err) throw err;
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

async function init() {
  await deleteDir(path.join(__dirname, "files-copy"));
  await copyDir(
    path.join(__dirname, "files"),
    path.join(__dirname, "files-copy")
  );
}
init();
