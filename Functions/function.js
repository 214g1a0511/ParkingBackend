const crypto = require("crypto");

function generateUniqueId() {
  const timestamp = Date.now();

  const randomBytes = crypto.randomBytes(6).toString("hex");

  const uniqueId = `${timestamp}_${randomBytes}`;

  return uniqueId;
}

module.exports = { generateUniqueId };
