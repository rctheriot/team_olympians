const context = require.context('./flags-normal', true, /.png$/);

const obj = {};
context.keys().forEach((key) => {
  const countryCode = key.split('./').pop() // remove the first 2 characters
    .substring(0, key.length - 6); // remove the file extension
  obj[countryCode] = context(key);
});

export default obj;