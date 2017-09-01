const Eris = require('eris')
const utils = require('./main.js')
const messageCollector = require('./messageCollector.js')

module.exports = class MemerClass {
	constructor () {
		this.log = require('../utils/logger.js')
		for (const i in Object.keys(utils)) {
			this[Object.keys(utils)[i]] = utils[Object.keys(utils)[i]]
		}
		this.config = require('../config.json')
		this.version = this.config.version
		this.client = new Eris.Client(this.config.token, {
			disableEvents: this.disabledEvents,
			disableEveryone: true,
			messageLimit: 100,
			maxShards: 20
		})
		this.client.connect()
		this.ids = require('../ids.json')
		this.indexes = {
			'meme': {},
			'joke': {},
			'shitpost': {},
			'gt': {}
		}
		this.snek = require('snekfetch')
		this.r = require('rethinkdbdash')()
		this.db = require('./dbFunctions.js')(this.r)
		this.memes = require('../assets/memes.json')
		this.commands = require('fs').readdirSync('commands').join(' ').replace(/.js/g, '').split(' ').concat(Object.keys(require('../cmdConfig.json').aliases)) // ewww
	}

	createMessageCollector (channel, filter, options) {
		const collector = new messageCollector(channel, filter, options)
		return new Promise(resolve => {
			collector.on('end', (collected, reason) => {
				resolve([collected, reason])
			})
		})
	}

	codeblock (str, lang) {
		return `${'```'}${lang || ''}\n${str}\n${'```'}`
	}

	reply (str, msg) {
		if (!msg.channel) {
			return this.log('hmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm, spaghetti', 'warn')
		}
		msg.channel.createMessage(`${msg.author.mention}, ${str}`)
	}

	isDonator (userID, donatorLevel) {
		const user = this.client.guilds.get('281482896265707520').members.get(userID)
		if (!user) { return false }
		if (!donatorLevel) {
			return user.roles.includes(this.roleIDs['base'])
		}
		if (user.roles.includes(this.roleIDs[donatorLevel])) {
			return true
		} else if (donatorLevel === '5') {
			return user.roles.includes(this.roleIDs['10'])
		} else {
			return false
		}
	}
}