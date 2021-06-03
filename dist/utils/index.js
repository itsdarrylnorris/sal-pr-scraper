"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimer = exports.sleep = exports.capitalizeFirstLetter = exports.logging = void 0;
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const logging = function (message, payload = null) {
    let date = new Date();
    console.log(`[${date.toISOString()}] ${message}`);
    if (payload) {
        if (typeof payload === 'string' || payload instanceof String) {
            console.log(`[${date.toISOString()}] ${payload}`);
        }
        else {
            console.log(`[${date.toISOString()}] ${JSON.stringify(payload)}`);
        }
    }
};
exports.logging = logging;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function fetchWithTimer(url, options, timeout = 7000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
    ]);
}
exports.fetchWithTimer = fetchWithTimer;
//# sourceMappingURL=index.js.map