const getCountryLiveClock = require('country-live-clocks');

// Replace 'US' with any country code you want to test
const countryCode = 'US';

const liveClock = getCountryLiveClock(countryCode);

console.log(liveClock);