import express from 'express'
import fetch from "node-fetch"
import redis from'ioredis'
import getPhotos from './controller/getPhotos.js'
import {getDataFromKeys, getKeysFromRedis} from "./controller/function.js";
import {getErrors} from "./controller/logError.js";
import bodyParser from "body-parser";


const app = express()
// app.use(express.json());
export const client = redis.createClient(6379)
client.on('error', (err) => {
    console.log("Error " + err)
});


app.get('/photos', getPhotos);
app.get('/error', getErrors);





app.listen(3000, () => {
    console.log('Server listening on port: ', 3000)
});