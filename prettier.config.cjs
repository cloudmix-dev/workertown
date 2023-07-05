/** @type {import("prettier").Config} */
const config = {
  importOrder: ["<THIRD_PARTY_MODULES>", "^~?[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

module.exports = config;
