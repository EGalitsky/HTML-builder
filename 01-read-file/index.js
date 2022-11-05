const fs = require("fs");
const path = require("path");

let text = "";

const stream = fs.createReadStream(path.join(__dirname, "text.txt"));
stream.on("data", (chunk) => (text += chunk));
stream.on("end", () => console.log(text));
stream.on("error", () => console.error(error.message));
