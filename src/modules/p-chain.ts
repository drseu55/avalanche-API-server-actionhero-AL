import axios  from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export async function getTransactionByIdFromPChain(txId: string) {
    let response;

    try {
        response = await axios.get(`${process.env.ORTELIUS_API_ENDPOINT + `transactions/${txId}`}`);
    } catch (error) {
        return 1;
    }
    
    return response.data;
}

export async function getAddressInfoFromPChain(address: string) {
    let balanceResult;

    await axios.post(process.env.P_CHAIN_BC_CLIENT_BLOCK_ENDPOINT, {
        jsonrpc: '2.0',
        id: 1,
        method: 'platform.getBalance',
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

    return balanceResult;
}
