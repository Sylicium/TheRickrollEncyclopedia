

let logger = require("./localModules/logger")()
try {
    require("dotenv").config()
} catch(e) { console.log(e) }

logger.log("Starting...")


const Database = require("./localModules/Database.js")
const MongoClient = require('mongodb').MongoClient;

let url = process.env.MONGODB_URL

logger.info("Tentative de connection à MongoDB...")
MongoClient.connect(url, function(err, Mongo) {
    if(err) throw err
    Database._setMongoClient(Mongo)
    Database._useDb("rickrolls")
    logger.info("  Mongo instance connected.")
    _allCode()
})

function _allCode() {

logger.log("Starting _allCode().")

let server = require("./server")
server.run()
logger.log("Server started.")


}