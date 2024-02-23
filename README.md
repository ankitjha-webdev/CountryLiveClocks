# Country Live Clocks

Country Live Clock is a versatile npm package designed to provide real-time timezone information for any country. By simply passing a country code, users can retrieve an array of objects detailing the current time across all the time zones within that country. This package is ideal for applications requiring accurate global time display, scheduling software that spans multiple time zones, or anyone needing a quick way to check the time in different parts of the world.

## Features

- Fetch real-time timezone information by country code.
- Supports all countries and their respective time zones.
- Easy to integrate with any JavaScript project including frameworks like React, Vue, Angular, and backend Node.js applications.

## Installation

To install Country Live Clocks, run the following command in your project directory:

bash
`npm install country-live-clocks`

## Usage

Here's a quick example to get you started:

```javascript
const { getCountryLiveClock } = require('country-live-clocks');
// Replace 'US' with the country code you're interested in
getCountryLiveClock('US').then(timezones =>> {
console.log(timezones);
}).catch(error =>> {
console.error('Error fetching timezones:', error);
});
```

## API

### `getCountryLiveClock(countryCode)`

- `countryCode` - A string representing the ISO 3166-1 alpha-2 country code.
- Returns: A promise that resolves to an array of timezone objects for the specified country.

## Contributing

Contributions are always welcome! Please read the [contributing guide](CONTRIBUTING.md) to learn how you can help improve Country Live Clocks.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have any questions, please file an issue on the [GitHub issues page](https://github.com/ankitjha-webdev/CountryLiveClocks/issues).

## Acknowledgments

- Thanks to all the contributors who have helped to make this project better.
