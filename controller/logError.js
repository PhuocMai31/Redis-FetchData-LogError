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
        console.log(errorResult)
        if (errorResult.length > 0){
            let data = []
            for (let i = 0; i < errorResult.length; i++) {
                let errorDetail = {};
                const errorValue = await client.get(`${errorResult[i]}`);
                let parsedJson = JSON.parse(errorValue);
                parsedJson.value = parsedJson.value.replace(/^"(.*)"$/, '$1');
                data.push(parsedJson);
                const containsOpenBracket = data[0].value.includes('{"');
                console.log(containsOpenBracket)
                if (containsOpenBracket){
                    var parsedResponse = data.map(item => {
                        const parsedValue = JSON.parse(item.value);
                        return { ...item, value: parsedValue };
                    });
                  return res.json(parsedResponse)
                }
            }
            console.log(data)
            res.json(data)
        } else res.json({message: "nodata"})
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

export async function getListKeysError(req, res) {
    try{
        const listKeysError = await client.keys('*')
        console.log(listKeysError)
        for (let i = 0; i < listKeysError.length; i++) {
            const pattern = /\d{1,2}\/\d{1,2}\/\d{4}/; // Mẫu ngày tháng dạng dd/mm/yyyy
            if (pattern.test(listKeysError[i])) {
                listKeysError.splice(i, 1);
                i--; // Giảm giá trị của biến đếm để xử lý phần tử tiếp theo
            }
        }
        console.log(listKeysError)
        res.json(listKeysError)
    } catch (error){
        res.send(error)
    }
}
