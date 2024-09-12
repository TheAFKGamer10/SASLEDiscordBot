let crypto = require("crypto");
let env = require("dotenv").config();

let accesskeyparts = process.argv[2].split(":");
const accesskeydecipher = crypto.createDecipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), Buffer.from(accesskeyparts.shift() || "", "hex"));
let decryptedaccesskey = accesskeydecipher.update(accesskeyparts.join(":"), "hex", "utf8") + accesskeydecipher.final("utf8");

console.log(decryptedaccesskey);