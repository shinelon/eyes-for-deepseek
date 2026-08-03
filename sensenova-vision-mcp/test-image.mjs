import { toDataUrl } from "./dist/image.js";
import { writeFile, rm } from "node:fs/promises";

const TEST_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

let pass = 0;
let fail = 0;
const ok = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  cond ? pass++ : fail++;
};

await writeFile("test-tmp.png", Buffer.from(TEST_PNG_B64, "base64"));
const d1 = await toDataUrl("test-tmp.png");
ok("本地 png 路径 → data:image/png;base64,...", d1.startsWith("data:image/png;base64,"));
ok("本地 base64 内容正确", d1.endsWith(TEST_PNG_B64));

ok("http URL 直传", (await toDataUrl("https://example.com/x.jpg")) === "https://example.com/x.jpg");
ok("data URL 直传", (await toDataUrl("data:image/png;base64,abc")) === "data:image/png;base64,abc");

try {
  await toDataUrl("foo.txt");
  ok("不支持扩展名 .txt 应抛错", false);
} catch (e) {
  ok("不支持扩展名 .txt 抛错", /Unsupported image extension/.test(e.message));
}

try {
  await toDataUrl("foo.gif");
  ok("gif 现应被拒（MIME 已收紧）", false);
} catch (e) {
  ok("gif 被拒: " + e.message.slice(0, 30), /Unsupported image extension/.test(e.message));
}

try {
  await toDataUrl("no-such-file.png");
  ok("不存在文件应抛错", false);
} catch (e) {
  ok("不存在文件抛错", true);
}

await rm("test-tmp.png");
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
