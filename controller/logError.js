import fetch from "node-fetch";
import express from 'express'
import redis from'redis'
import {client} from "../server.js";
import { generateJSON, getDataFromKey, getDataFromKeys, getKeysFromRedis} from "./function.js";

export async function insertError(keyError, value) {
    const errorLog = keyError;
    console.log(JSON.stringify(value), "bodyyyyy")
    const time = new Date();
    const object = {
        value: JSON.stringify(value),
        time: time
    }
    // toa 1 key moi hoan toan
    //  set vao redis
    //  push  1 key  no vao list
    client.lpush(`${keyError}`, `${JSON.stringify(object)}`);

}

export async function getErrors(req,res) {
    try {
        const {keyError} = req.query;
        const key = await getKeysFromRedis(keyError);
        const data = await getDataFromKey(key);
        const finalData = await generateJSON(key,data )
        res.send(JSON.parse(finalData))
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

