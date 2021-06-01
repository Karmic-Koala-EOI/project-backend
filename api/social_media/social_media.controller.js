const twitter = require('twitter');
const koala = new twitter({
    consumer_key:"LtcIVmBHUAr4ITxKWaHpI8RFI",
    consumer_secret:"3B2VV00u9h3HoUpn1ZpQM4gH8CxuPl6pRdamFrNTEplXXXGJ4V",

    access_token_key:"1399639642186686466-FPesEfUzAIkZBoi7Nxrq3MdHTvJEhP",
    access_token_secret:"JYn6qyQQaKUNSlTd9OkiRDqkpPYYaiPtm2fFwU0Q26xBv"
});

const postTweet = async (req, res) => {
    const status = req.body.status;

    try{
        const resp = await koala.post('statuses/update',{status: `${status}`});
        return res.status(200).json(resp);

    } catch(err) {
        return res.status(400).send('Post fail');
    }
}

module.exports = {
    postTweet
}
