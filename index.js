const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'build')))

app.get("/.well-known/nostr.json", (req, res) => {
    if (req.query.name === 'fluizsp')
        res.send({ "names": { "fluizsp": "6d21157c48d75f8a979552d9b1160f66bed66b76dd47886ddb914011c2da1841" } })
    if (req.query.name === '_')
        res.send({ "names": { "broadcstr": "5bbb8e97d5c68afc68e46d7f858aefc73d161c85264fbfb99d91ed83bf1b9d23" } })
})

app.get("*", async (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log('Server is running on port' + PORT));