import {client} from "../server.js";

export function getKeysFromRedis(keysError) {
    console.log(keysError, "1234")
    return new Promise((resolve, reject) => {
        client.keys(`${keysError}`, (err, keys) => {
            if (err) reject(err);
            console.log(keys);
            resolve(keys);
        });
    });
}

export async function getDataFromKeys(keys) {
    const data = [];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = await getValueFromKey(key);
        console.log(`Key: ${key}, Value: ${value}`);
        data.push(`{Key: ${key}, Value: ${value}}`);
    }
    return data;
}
export async function getDataFromKey(key) {
    console.log(key + "2222")
        const value = await getValueFromKey(key);
        return value;
}

export async function generateJSON(key, values) {
    const errorArray = values.map((value, index) => ({
        [`Value${index + 1}`]: JSON.parse(value)
    }));

    const result = {
        Key: key,
        Error: errorArray
    };

    return JSON.stringify(result);
}

export function getValueFromKey(key) {
    console.log(key + 'getValueFromKey')
    return new Promise((resolve, reject) => {
        client.lrange(`${key}`, 0,-1,(err, value) => {
            if (err) reject(err);
            console.log(value)
            resolve(value);
        });
    });
}
