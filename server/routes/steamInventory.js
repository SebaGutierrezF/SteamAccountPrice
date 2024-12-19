const express = require('express');
const axios = require('axios');
const router = express.Router();

const STEAM_API_KEY = process.env.STEAM_API_KEY;

async function getInventory(steamid, appid, contextid) {
    const url = `https://steamcommunity.com/inventory/${steamid}/${appid}/${contextid}?l=english&count=5000`;
    
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    };

    const response = await axios.get(url, { headers });
    return response.data;
}

async function getItemPrice(marketHashName) {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encodeURIComponent(marketHashName)}`;
            const response = await axios.get(url);
            
            if (response.data && response.data.success) {
                return response.data.lowest_price ? 
                    parseFloat(response.data.lowest_price.replace('$', '').trim()) : 0;
            }
            return 0;
        } catch (error) {
            console.error(`Intento ${retryCount + 1}/${maxRetries} fallido para ${marketHashName}:`, error.message);
            retryCount++;
            
            if (retryCount === maxRetries) {
                console.error(`Error final al obtener precio para ${marketHashName}`);
                return 0;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return 0;
}

router.get('/inventory/value/:steamid/stream', async (req, res) => {
    const steamid = req.params.steamid;
    const appid = 730;
    const contextid = 2;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendProgress = (message) => {
        res.write(`data: ${JSON.stringify({ type: 'progress', message })}\n\n`);
    };

    try {
        sendProgress('Conectando con Steam...');
        const inventory = await getInventory(steamid, appid, contextid);
        
        if (!inventory || !inventory.assets || !inventory.descriptions) {
            throw new Error('Inventario no disponible o privado');
        }

        let totalValue = 0;
        const processedItems = new Set();
        const descriptionsMap = new Map(
            inventory.descriptions.map(desc => [
                `${desc.classid}_${desc.instanceid}`,
                desc
            ])
        );

        sendProgress(`Encontrados ${inventory.assets.length} items para procesar`);

        for (const asset of inventory.assets) {
            const key = `${asset.classid}_${asset.instanceid}`;
            const description = descriptionsMap.get(key);
            
            if (description && description.market_hash_name) {
                if (!processedItems.has(description.market_hash_name)) {
                    sendProgress(`Obteniendo precio para: ${description.market_hash_name}`);
                    const itemPrice = await getItemPrice(description.market_hash_name);
                    totalValue += itemPrice;
                    processedItems.add(description.market_hash_name);
                    
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }

        res.write(`data: ${JSON.stringify({
            type: 'result',
            totalValue: totalValue.toFixed(2),
            currency: 'USD',
            itemsProcessed: processedItems.size
        })}\n\n`);

        res.end();
    } catch (error) {
        res.write(`data: ${JSON.stringify({
            type: 'error',
            message: error.message
        })}\n\n`);
        res.end();
    }
});

module.exports = router;
