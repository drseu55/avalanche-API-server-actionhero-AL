import axios  from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export async function getTransactionByIdFromXChain(txId: string) {
    let response;

    try {
        response = await axios.get(`${process.env.ORTELIUS_API_ENDPOINT + `transactions/${txId}`}`);
    } catch (error) {
        return 1;
    }
    
    return response.data;
}

export async function getAddressInfoByHashFromXChain(address: string) {
    let balanceResult;

    await axios.post(process.env.X_CHAIN_BC_CLIENT_BLOCK_ENDPOINT, {
        jsonrpc: '2.0',
        id: 1,
        method: 'avm.getAllBalances',
        params: {
                address: `${address}`
        }
    }, {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
    }).then(response => {
        balanceResult = [0, response.data.result];
    }).catch(error => {
        if(!error.response) {
            console.log("connection refused to avalanche client");
            balanceResult = [1, JSON.parse('{"result":"connection refused to avalanche client"}')];
        } else {
            console.log(error.response.data);
            balanceResult = [1, error.response.data];
        }
    });

    if (balanceResult[0] == 1 || typeof balanceResult[1] == 'undefined') {
        balanceResult[0] = 1
        return balanceResult;
    }

    let responseForAssets;

    if (balanceResult[1].balances.length <= 0) {
        return [balanceResult[1].balances, 'AVAX'];
    }

    for(let i = 0; i < balanceResult[1].balances.length; i++) {
        responseForAssets = await axios.post(process.env.X_CHAIN_BC_CLIENT_BLOCK_ENDPOINT, {
            jsonrpc: '2.0',
            id: 1,
            method: 'avm.getAssetDescription',
            params: {
                'assetID' :`${balanceResult[1].balances[i].asset}`
            }
        }, {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
        });
    }
    
    return [balanceResult[1].balances, responseForAssets.data.result];
}