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
exports.extractUrls = exports.extractTwitterHandles = exports.extractEmails = exports.fetchAndParse = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
// Main function to fetch and parse a webpage
function fetchAndParse(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
            headless: "new",
            executablePath: '/usr/bin/google-chrome',
        });
        const page = yield browser.newPage();
        yield page.goto(url, { waitUntil: 'networkidle2' });
        const content = yield page.content();
        console.log(`content: ${content}`);
        // Extract data based on options
        const extractedData = {
            emails: options.includeEmails ? extractEmails(content) : [],
            twitterHandles: options.includeTwitterHandles ? extractTwitterHandles(content) : [],
            urls: options.includeUrls ? extractUrls(content) : [],
        };
        yield browser.close();
        return extractedData;
    });
}
exports.fetchAndParse = fetchAndParse;
// Regex functions
function extractEmails(content) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return Array.from(new Set(content.match(emailRegex) || []));
}
exports.extractEmails = extractEmails;
function extractTwitterHandles(content) {
    var _a;
    const twitterHandleRegex = /(?:^|\s)@(\w{1,15})\b/g;
    return Array.from(new Set(((_a = content.match(twitterHandleRegex)) === null || _a === void 0 ? void 0 : _a.map(handle => `@${handle.trim()}`)) || []));
}
exports.extractTwitterHandles = extractTwitterHandles;
function extractUrls(content) {
    const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*/g;
    return Array.from(new Set(content.match(urlRegex) || []));
}
exports.extractUrls = extractUrls;
