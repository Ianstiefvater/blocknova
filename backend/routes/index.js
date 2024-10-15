const express = require('express');
const router = express.Router();
const {ROLE} = require('../config/constant');
const AuthMiddleware = require('../middlewares/Authentication');

const UserRouter = require('./user')
const NyxcipherRouter = require('./nyxcipher')
const ItemRouter = require('./item')
const TicketRouter = require('./ticket')
const PaymentRouter = require('./payment')
const AuthRouter = require('./auth')
const { updateCronJobInterval, getStoredTransactions } = require('../cron/cronJobs');


//------------ Welcome Route ------------//
router.get('/', AuthMiddleware(["Customer", "Sponsor"]), (req, res) => {
    res.status(200).send({data: 'Welcome Oasis'});
});
// New route for setting cron interval
router.post('/set-cron-interval', (req, res) => {
    const { minutes } = req.body;
    if (minutes && Number(minutes) > 0) {
        updateCronJobInterval(minutes);
        res.json({ message: `Cron job interval set to every ${minutes} minutes.` });
    } else {
        res.status(400).json({ error: 'Invalid interval value' });
    }
});
router.get('/get-transactions', (req, res) => {
    const transactions = getStoredTransactions();
    res.json({ transactions });
});


router.use('/user', UserRouter);
router.use('/nyxcipher', NyxcipherRouter);
router.use('/item', ItemRouter);
router.use('/ticket', TicketRouter);
router.use('/payment', PaymentRouter);
router.use('/auth', AuthRouter)

module.exports = router;