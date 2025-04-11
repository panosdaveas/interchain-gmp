import path from "path";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import fs from "fs-extra";
import { fileURLToPath } from "url";

marked.setOptions({
  renderer: new TerminalRenderer(),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readmePath = path.join(__dirname, "../readme.md");
try {
  const readme = fs.readFileSync(readmePath, "utf8");
  console.log(marked(readme));
} catch (err) {
  console.error("Error reading README.md:", err);
}