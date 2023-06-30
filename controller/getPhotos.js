import express from 'express'
import fetch from "node-fetch"
import redis from'redis'
import {insertError} from "./logError.js";
import {client} from "../server.js";



export default async function getPhotos(req, res) {
        if(req.body){
            console.log(req.body)
            await insertError('body', req.body)
            const time = new Date()
            console.log(time)
            const photosRedisKey = 'user:photos';
            return client.get(photosRedisKey, async (err, photos) => {
                if (photos) {
                    return res.json({source: 'cache', data: JSON.parse(photos)})

                } else {
                    fetch('https://jsonplaceholder.typicode.com/photos')
                        .then(response =>
                            response.json())
                        .then(photos => {
                            client.setex(photosRedisKey, 3500, JSON.stringify(photos))
                            return res.json({source: 'api', data: photos})
                        })
                        .catch(error => {
                            console.log(error)
                            return res.json(error.toString())
                        })
                }
            });
        } else {
            await insertError('nobody', "No body data")
            res.status(400).send('noBodydata')
        }
}