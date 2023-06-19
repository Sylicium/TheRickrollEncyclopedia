//const logger = new (require("./logger"))()
//const somef = require("./someFunctions")

const somef = require('../localModules/someFunctions');
const MongoClient = require('mongodb').MongoClient;
// mongodb@4.1 !!!!!! Pas après

// v1.0.0 - 24/04/2022


/*function getdb() {
    db = MongoClient.connect(url, function(err, Mongo) {
        if(err) throw err
        TheMongoInstance = Mongo
        logger.debug("set mongo instance.")
    })
    return new Database(TheMongoInstance);
    
}*/


logger = {
    info: (...args) => { console.log(...args) },
    debug: (...args) => { console.log("DEBUG ",...args) },
}


let Temp_ = {
    guildDatas: {
        editing: {
            // "guild_id": false
        }
    }
}


class Database {
    constructor() {
        this.Mongo = undefined
        this._usedDataBaseName = undefined
        this._botInstance = undefined
    }

    __get__() { return this }

    _setMongoClient(the_mongo) {
        this.Mongo = the_mongo
        logger.debug("MongoClient singleton set.")
    }

    _useDb(DbName) {
        return this._usedDataBaseName = DbName
    }

    _setBotInstance_(bot) {
        this._botInstance = bot
    }

    async getAccountByID(identifiant) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").findOne({id:identifiant})
    }
    async findAccount(search_params) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").findOne(search_params)
    }
    async findAccounts(search_params) {
        return this.Mongo.db(this._usedDataBaseName).collection("accounts").find(search_params).toArray()
    }
    /**
     * f(): Renvoie un object permettant de manipuler les données de la BDD pour la guilde renseignée
     * @param {String} guild_id - L'id de la guilde à récupérer
     * @returns class_guildDatas
     */
    async getGuildDatas(guild_id) {
        try {
            let _temp_code_ = somef.genHex(8)
            while(Temp_.guildDatas.editing[guild_id]) { await somef.sleep(1)} // Evite de créer plusieur fois l'objet dans la base de donnée si il n'existait pas et que cette fonction est appellée plusieur fois très rapidement
            Temp_.guildDatas.editing[guild_id] = true
            logger.debug(`[${_temp_code_}] Temp_.guildDatas.editing[${guild_id}] set to true`)
            let object = await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").findOne({"guild.id": guild_id})
            //logger.debug("ok getGuildDatas")
            if(!object) {
                logger.debug("!object", (new Error()))
                let g = patterns.serverData(this._botInstance.guilds.cache.get(guild_id))
                await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").insertOne(g)
                object = await this.Mongo.db(this._usedDataBaseName).collection("serverDatas").findOne({"guild.id": guild_id})
            }
            Temp_.guildDatas.editing[guild_id] = false
            logger.debug(`[${_temp_code_}] Temp_.guildDatas.editing[${guild_id}] set to false`)
            return new ServerClass(
                {
                    databaseName: this._usedDataBaseName,
                    collectionName: "serverDatas",
                    _id: object._id
                },
                object
            )
        } catch(e) {
            Temp_.guildDatas.editing[guild_id] = false
            logger.debug(`[${_temp_code_}] Temp_.guildDatas.editing[${guild_id}] set to false (after catch)`)
        }
    }


    async getAllLinks() {
        return this.Mongo.db(this._usedDataBaseName).collection("links").find({ }).toArray()
    }
    async getAllLinks_notChecked(limitLength=10000) {
        //let l = await this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").find({ "url": { $regex: "dirty", $options: "g" } }).sort({
        let l = await this.Mongo.db(this._usedDataBaseName).collection("unfetchedLinks").find().sort({
            "createdAt": 1
        }).limit(limitLength).toArray()
        /*l = l.filter(x => {
            return (x.url.includes("dirtybiol") || x.url.includes("dibistan") || x.url.includes("dibi") )
        })*/
        return l
    }


}


let Database_ = new Database()

module.exports = Database_