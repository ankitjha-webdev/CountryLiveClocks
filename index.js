/**
 * An object containing the imported data for countries and timezones.
 * 
 * @type {{countries: Object.<string, string>, timezones: Object.<string, Object>}}
 */
const data = { countries: require('./data/countries.js'), timezones: require('./data/timezones.js') };

/**
 * Converts an argument to a property key.
 * 
 * @param {*} arg - The argument to convert to a property key.
 * @returns {string|symbol} - The converted property key.
 */
function _toPropertyKey(arg) {
    let key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
}

/**
 * Converts an input to its primitive value based on a hint.
 * 
 * This function attempts to convert a given input to a primitive value (string or number) based on the provided hint.
 * If the input is not an object or is null, it returns the input itself. If the input is an object with a @@toPrimitive
 * method, it calls this method with the hint to attempt to convert the object to a primitive. If the @@toPrimitive method
 * does not return a primitive value, a TypeError is thrown. If the input does not have a @@toPrimitive method, it converts
 * the input to a string if the hint is "string", or to a number otherwise.
 * 
 * @param {*} input - The input to convert to a primitive value.
 * @param {string} [hint="default"] - The preferred type of the output ("string" or "number").
 * @returns {string|number} - The primitive value of the input.
 * @throws {TypeError} - Throws if @@toPrimitive does not return a primitive value.
 */
function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
        let res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
}

let timezonesMap;

/**
 * Constructs a country object with its associated timezones.
 * 
 * This function takes a data object containing countries and their timezones, and an ID representing
 * a specific country. It then constructs and returns an object containing the country's ID, name,
 * current timezones, and all associated timezones. If the country ID does not exist in the data,
 * the function returns null.
 * 
 * @param {Object} data - The data object containing countries and timezones.
 * @param {string} id - The ID of the country to build the object for.
 * @returns {Object|null} An object containing the country's details and timezones, or null if the country ID is not found.
 */
function buildCountry(data, id) {
    const name = data.countries[id];
    if (!name) return null;
    const tzMap = getTimezonesMap(data)[id] || {};
    return {
        id,
        name,
        timezones: tzMap.current || [],
        allTimezones: tzMap.all || []
    };
}

/**
 * Retrieves or constructs a map of timezones.
 * 
 * This function checks if a global map of timezones has already been constructed. If not,
 * it calls `buildTimezonesMap` to create the map using the provided data. Once the map is
 * available, it returns the map for further use.
 * 
 * @param {Object} data - The data object containing countries and timezones.
 * @returns {Object} A map of timezones.
 */
function getTimezonesMap(data) {
    if (!timezonesMap) timezonesMap = buildTimezonesMap(data);
    return timezonesMap;
}

/**
 * Defines a property on an object, with a given key and value.
 * If the key already exists on the object, it uses `Object.defineProperty` to set the property,
 * ensuring the property is enumerable, configurable, and writable. If the key does not exist,
 * it simply assigns the value to the object using the key.
 * 
 * @param {Object} obj - The object on which to define the property.
 * @param {string} key - The key of the property to define.
 * @param {*} value - The value to set for the property.
 * @returns {Object} The original object with the newly defined or updated property.
 */
function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}

/**
 * Builds a map of timezones based on the provided data.
 * 
 * This function iterates over the timezones in the provided data, constructing a map where each
 * country code maps to an object containing arrays of current and all associated timezone IDs.
 * If a timezone has an alias, the countries associated with the alias are used. Timezones without
 * a specified region (r) are considered current.
 * 
 * @param {Object} data - The data object containing timezones and their associated countries.
 * @returns {Object} A map where keys are country codes and values are objects with 'current' and 'all' timezone arrays.
 */
function buildTimezonesMap(data) {
    return Object.keys(data.timezones).reduce((result, id) => {
        const { c: countries, a: alias, r } = data.timezones[id];
        const aliasTz = data.timezones[alias] || {};
        const tzCountries = countries || aliasTz.c;
        if (!tzCountries) return result;
        tzCountries.forEach((country) => {
            if (!result[country]) result[country] = { current: [], all: [] };
            if (r === undefined) result[country].current.push(id);
            result[country].all.push(id);
        });
        return result;
    }, {});
}

const countries = {};
const timezones = {};

/**
 * Retrieves a country object by its ID, optionally applying transformations based on provided options.
 * If the country is not already memoized, it will build and memoize the country before returning it.
 * 
 * @param {string} id - The unique identifier for the country to retrieve.
 * @param {Object} options - Optional parameters to modify the returned country object.
 * @returns {Object|null} The country object corresponding to the provided ID, modified by the provided options, or null if not found.
 */
function getCountry(id, options = {}) {
    if (!countries[id]) memoizeCountry(buildCountry(data, id));
    return deliverCountry(countries[id], options);
}

/**
 * Caches a country object by its ID in a global store.
 * 
 * This function checks if the provided country object is truthy, and if so, it stores the country object
 * in a global `countries` object using the country's ID as the key. This memoization helps in avoiding
 * redundant country object constructions for subsequent retrievals.
 * 
 * @param {Object} country - The country object to be memoized.
 */
function memoizeCountry(country) {
    if (country) countries[country.id] = country;
}

/**
 * Retrieves the timezones for a given country by its ID, optionally applying transformations based on provided options.
 * 
 * This function first retrieves the country object by its ID, applying any provided options. If the country is not found,
 * it returns null. Otherwise, it retrieves the timezones associated with the country, mapping each timezone through the
 * getTimezone function to ensure they are properly formatted or memoized before returning the array of timezones.
 * 
 * @param {string} countryId - The unique identifier for the country whose timezones are to be retrieved.
 * @param {Object} options - Optional parameters to modify the returned country object before retrieving its timezones.
 * @returns {Array|null} An array of timezone objects corresponding to the provided country ID, modified by the provided options, or null if the country is not found.
 */
function getTimezonesForCountry(countryId, options = {}) {
    const country = getCountry(countryId, options);
    if (!country) return null;
    let values = country.timezones || [];
    return values.map(getTimezone);
}

/**
 * Modifies and returns a country object with the appropriate set of timezones based on the deprecated flag.
 * 
 * This function takes a country object and an options object. The options object can contain a deprecated flag
 * that determines which set of timezones (allTimezones or the current timezones) should be included in the returned
 * country object. If the country object is null, it returns null. Otherwise, it returns a new country object with
 * the selected set of timezones.
 * 
 * @param {Object} country - The country object to be modified.
 * @param {Object} options - An options object that can contain a deprecated flag.
 * @param {boolean} options.deprecated - A flag indicating whether to use allTimezones (true) or current timezones (false).
 * @returns {Object|null} A new country object with the appropriate set of timezones or null if the input country is null.
 */
function deliverCountry(country, { deprecated = false } = {}) {
    if (!country) return null;
    const { allTimezones, ...other } = country;
    const tz = deprecated ? allTimezones : country.timezones;
    return { ...other, timezones: tz };
}

/**
 * Performs a deep merge of objects and returns a new object. Properties are merged from left to right.
 * Subsequent sources' properties will overwrite those of previous ones.
 * 
 * @param {Object} target - The target object to which properties will be assigned.
 * @returns {Object} The target object after properties from sources have been assigned.
 */
function _objectSpread2(target) {
    for (var index = 1; index < arguments.length; index++) {
        var source = null != arguments[index] ? arguments[index] : {};
        index % 2 ? ownKeys(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}

/**
 * Retrieves all the own property names and symbols of an object.
 * If the second parameter is true, it filters out non-enumerable symbols.
 * 
 * @param {Object} e - The object from which to retrieve the properties and symbols.
 * @param {boolean} [r=false] - A flag indicating whether to filter out non-enumerable symbols.
 * @returns {Array} An array containing all the own property names and symbols of the object.
 */
function ownKeys(e, r = false) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        if (r) {
            o = o.filter(function (r) {
                return Object.getOwnPropertyDescriptor(e, r).enumerable;
            });
        }
        t.push.apply(t, o);
    }
    return t;
}

/**
 * Retrieves a timezone object by its name. If the timezone is not already memoized, it attempts to build and memoize it.
 * The returned timezone object is a shallow copy to prevent unintended mutations.
 * 
 * @param {string} name - The name of the timezone to retrieve.
 * @returns {Object|null} A shallow copy of the timezone object if found, otherwise null.
 */
function getTimezone(name) {
    if (!timezones[name]) memoizeTimezone(buildTimezone(data, name));
    return timezones[name] ? _objectSpread2({}, timezones[name]) : null;
}

/**
 * Caches a timezone object by its name in a global timezones map.
 * If the timezone object is not null or undefined, it is added to the map using its name as the key.
 * 
 * @param {Object} timezone - The timezone object to be memoized.
 */
function memoizeTimezone(timezone) {
    if (timezone) timezones[timezone.name] = timezone;
}

/**
 * Constructs a timezone object based on the provided data and timezone name.
 * 
 * This function looks up a timezone by its name in the provided data object. If the timezone
 * is found, it constructs a new object containing the timezone's details, including its name,
 * countries it is associated with, UTC offset, daylight saving time (DST) offset, and its alias
 * if any. It also calculates and includes string representations of the UTC and DST offsets.
 * If the timezone is marked as deprecated in the data, this status is also included in the result.
 * If the timezone is not found, the function returns null.
 * 
 * @param {Object} data - The data object containing timezones.
 * @param {string} name - The name of the timezone to construct the object for.
 * @returns {Object|null} The constructed timezone object, or null if the timezone is not found.
 */
function buildTimezone(data, name) {
    const timezone = data.timezones[name];
    if (!timezone) return null;
    const { a: aliasOf, c: countries, u: utcOffset, d: dstOffset = utcOffset, r } = timezone;
    const result = {
        name,
        countries,
        utcOffset,
        utcOffsetStr: getOffsetStr(utcOffset),
        dstOffset,
        dstOffsetStr: getOffsetStr(dstOffset),
        aliasOf
    };
    if (r) result.deprecated = true;
    return result;
}

/**
 * Converts an offset value into a string representation of the timezone offset.
 * 
 * This function takes an offset value in minutes and converts it into a string
 * representation formatted as "+HH:MM" or "-HH:MM" depending on whether the offset
 * is positive or negative. This is useful for displaying timezone offsets in a
 * human-readable format.
 * 
 * @param {number} offset - The timezone offset in minutes.
 * @returns {string} The formatted timezone offset as a string.
 */
function getOffsetStr(offset) {
    const sign = offset < 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60).toString().padStart(2, '0');
    const minutes = (absOffset % 60).toString().padStart(2, '0');
    return `${sign}${hours}:${minutes}`;
}

/**
 * Generates a list of current times in the top 5 timezones for a given country.
 * 
 * @param {string} countryCode - The ISO 3166-1 alpha-2 country code.
 * @returns {Array.<{timezone: string, time: string}>} An array of objects, each containing a timezone and its current time.
 */
async function getCountryLiveClock(countryCode) {
    return new Promise((resolve, reject) => {
        if (!countryCode) reject(new Error("Country Code is required"));
        
        const timezonesForCountry = getTimezonesForCountry(countryCode.toUpperCase());
        if (!timezonesForCountry?.length) reject(new Error("Invalid Country Code"));
        
        const result = timezonesForCountry.slice(0, 5).map(({ name: timezone }) => ({
            timezone,
            time: new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour12: true, timeStyle: 'short' })
        }));
        resolve(result);
    });
}

module.exports = getCountryLiveClock;