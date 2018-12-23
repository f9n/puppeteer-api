import fs from "fs";
import crypto from "crypto";

const errors = [null, "", undefined];

exports.writeFile = (filename, data) => {
  if (errors.includes(data)) {
    fs.writeFileSync(filename, JSON.stringify(data));
  } else {
    fs.writeFileSync(filename, "");
  }
};

exports.hashIt = something => {
  return crypto
    .createHash("md5")
    .update(something, "utf8")
    .digest("hex");
};
