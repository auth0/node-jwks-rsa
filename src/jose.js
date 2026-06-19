let jose;
const dynamicImport = new Function('specifier', 'return import(specifier)');

function getJose() {
  if (!jose) {
    jose = dynamicImport('jose');
  }

  return jose;
}

module.exports = {
  getJose
};
