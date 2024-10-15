require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const cron = require('node-cron');

const bitqueryAPI = "https://streaming.bitquery.io/graphql";
const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.BITQUERY_API_KEY
};

let cronTask;
let storedTransactions = [];

function updateCronJobInterval(minutes) {
    const query = {
        query: `{
          EVM(network: eth) {
            Transfers(orderBy: {descending: Transaction_Value}, limit: {count: 10}) {
              Transaction {
                Hash
                Value
                From
                To
              }
              Block {
                Number
              }
            }
          }
        }`
    };

    if (cronTask) {
        cronTask.stop();
    }

    cronTask = cron.schedule(`*/${minutes} * * * * `, async () => {
        try {
            const response = await axios.post(bitqueryAPI, query, { headers });
            const transactions = response.data.data.EVM.Transfers.map((tx) => ({
                hash: tx.Transaction.Hash,
                value: tx.Transaction.Value,
                from: tx.Transaction.From,
                to: tx.Transaction.To,
                blockHeight: tx.Block.Number
            }));

            console.log('Transactions:', transactions); 
            storedTransactions = transactions;

        } catch (error) {
            console.error('Error fetching data from Bitquery:', error);
        }
    });
}

module.exports = {
    updateCronJobInterval,
    getStoredTransactions: () => storedTransactions 
};

