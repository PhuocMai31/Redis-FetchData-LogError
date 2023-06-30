import fetch from "node-fetch";
import express from 'express'
import redis from'redis'
import {client} from "../server.js";
import { generateJSON, getDataFromKey, getDataFromKeys, getKeysFromRedis} from "./function.js";

export async function insertError(keyError, value) {
    const errorLog = keyError;
    const time = new Date();
    const object = {
        keyError: keyError,
        value: JSON.stringify(value),
        time: time.toLocaleString()
    }
    const values = `${keyError}_${time}`
     client.lpush(`${keyError}`, `${keyError}-${time.toLocaleString()}`);
     client.set(`${keyError}-${time.toLocaleString()}`, JSON.stringify(object));
}

export async function getErrorsWithKey(req,res) {
    try {
        const {keyError} = req.query;
        const errorResult = await client.lrange(keyError, 0 , -1)
        if (errorResult.length > 0){
            let data = []
            let tempVariable = []
            for (let i = 0; i < errorResult.length; i++) {
                const errorValue = await client.get(`${errorResult[i]}`);
                let parsedJson = JSON.parse(errorValue);
                parsedJson.value = parsedJson.value.replace(/^"(.*)"$/, '$1');
                tempVariable.push(parsedJson);
                const containsOpenBracket = tempVariable[0].value.includes('{"');
                if (containsOpenBracket){
                    var parsedResponse = tempVariable.map(item => {
                        const parsedValue = JSON.parse(item.value);
                        return { ...item, value: parsedValue };
                    });
                    data = parsedResponse
                } else {
                    data.push(parsedJson)
                }
            }
            res.json(data)
        } else res.json({message: "nodata"})
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
}

export async function getListKeysError(req, res) {
    try{
        const listKeysError = await client.keys('*')
        console.log(listKeysError)
        for (let i = 0; i < listKeysError.length; i++) {
            const pattern = /\d{1,2}\/\d{1,2}\/\d{4}/;
            if (pattern.test(listKeysError[i])) {
                listKeysError.splice(i, 1);
                i--;
            }
        }
        console.log(listKeysError)
        res.json(listKeysError)
    } catch (error){
        res.send(error)
    }
}
