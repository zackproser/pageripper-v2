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
const express_1 = __importDefault(require("express"));
const fetchAndParse_1 = require("./fetchAndParse"); // Import the fetch and parse module
const app = (0, express_1.default)();
const port = 3000;
// Middlewares
app.use(express_1.default.json());
// Define the route for fetching and parsing a webpage
app.post('/parse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url, options } = req.body;
        if (!url) {
            return res.status(400).send('URL is required');
        }
        console.log(`Fetching and parsing ${url}`);
        const parsedData = yield (0, fetchAndParse_1.fetchAndParse)(url, options);
        res.status(200).json(parsedData);
    }
    catch (error) {
        console.log(`error: ${error}`);
        res.status(500).send('Error processing your request');
    }
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
