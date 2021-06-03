"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalPrToCsv = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
require("isomorphic-fetch");
const dist_1 = __importDefault(require("jsonexport/dist"));
const node_abort_controller_1 = __importDefault(require("node-abort-controller"));
const utils_1 = require("./utils");
const fsPromises = fs_1.default.promises;
class SalPrToCsv {
    constructor() {
        this.baseUrl = 'https://www.sal.pr';
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getListOfResturants();
        });
    }
    getListOfResturants() {
        return __awaiter(this, void 0, void 0, function* () {
            let pageCount = 0;
            let maxOfFetchResults = 1620;
            let payload;
            let rawData;
            let fetchPath;
            let alreadyCheckResturant = [];
            let resturantsData = [];
            while (pageCount !== maxOfFetchResults) {
                const fetchPathAbortController = new node_abort_controller_1.default();
                fetchPath = `${this.baseUrl}/?search=5&s=restaurantes&field_name=&order=a&start=${pageCount}`;
                utils_1.logging(`Trying to fetch url: ${fetchPath}`);
                try {
                    payload = yield fetch(fetchPath, { signal: fetchPathAbortController.signal });
                    rawData = yield payload.text();
                    const $ = cheerio_1.default.load(rawData);
                    if (!payload) {
                        utils_1.logging('We could not find any payload.');
                        return;
                    }
                    $('.wrap_info_container a').each((index) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        let element = $('.wrap_info_container a')[index];
                        let atag = $(element).attr('href') ? (_a = $(element).attr('href')) === null || _a === void 0 ? void 0 : _a.toString() : '';
                        if (!atag || alreadyCheckResturant.includes(atag))
                            return;
                        alreadyCheckResturant.push(atag);
                    }));
                    try {
                        yield Promise.all(alreadyCheckResturant.map((productPath) => __awaiter(this, void 0, void 0, function* () {
                            var _b, _c, _d;
                            let productFetchData = yield fetch(`${this.baseUrl}${productPath}`);
                            utils_1.logging(`Fetching ... ${this.baseUrl}${productPath}`);
                            if (!productFetchData) {
                                utils_1.logging('We could not find any productFetchData.');
                                return;
                            }
                            const rawProductFetchData = yield productFetchData.text();
                            const $productData = cheerio_1.default.load(rawProductFetchData);
                            let resturantInformation = {
                                resturantName: $productData('.top-big-description h1').eq(0).text()
                                    ? $productData('.top-big-description h1').eq(0).text()
                                    : '',
                                phoneNumber: $productData('.i_contact').eq(0).next().text()
                                    ? $productData('.i_contact').eq(0).next().text()
                                    : '',
                                facebook: ((_b = $productData('.i_facebook').eq(0).attr('href')) === null || _b === void 0 ? void 0 : _b.toString())
                                    ?
                                        $productData('.i_facebook').eq(0).attr('href').toString()
                                    : '',
                                address1: $productData('p[itemprop="streetAddress"]').eq(0).text()
                                    ? $productData('p[itemprop="streetAddress"]').eq(0).text()
                                    : '',
                                city: $productData('.i_location').eq(1).next().text()
                                    ? $productData('.i_location').eq(1).next().text()
                                    : '',
                                hours: $productData('.i_time').eq(0).next().text() ? $productData('.i_time').eq(0).next().text() : '',
                                resturantType: $productData('ul .food-type li').text() ? $productData('ul .food-type li').text() : '',
                                resturantWebsite: ((_c = $productData('#button_website').eq(0).attr('href')) === null || _c === void 0 ? void 0 : _c.toString())
                                    ? (_d = $productData('#button_website').eq(0).attr('href')) === null || _d === void 0 ? void 0 : _d.toString()
                                    : '',
                            };
                            resturantsData.push(resturantInformation);
                            utils_1.logging(`Found something in ${productPath}`);
                        })));
                    }
                    catch (e) {
                        utils_1.logging(`Failed to fetch product data in ${fetchPath}`, e);
                    }
                }
                catch (e) {
                    utils_1.logging(`Failed to fetch data in ${fetchPath}`, e);
                }
                pageCount += 30;
                yield utils_1.sleep(1000);
            }
            utils_1.logging('Done getting data');
            try {
                const csv = yield dist_1.default(resturantsData);
                yield fsPromises.writeFile(__dirname + 'data.csv', csv);
                utils_1.logging('Total ... ', { csv });
            }
            catch (err) {
                utils_1.logging('Something went wrong', err);
            }
        });
    }
}
exports.SalPrToCsv = SalPrToCsv;
new SalPrToCsv().init();
//# sourceMappingURL=app.js.map