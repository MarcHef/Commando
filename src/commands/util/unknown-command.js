const Command = require('../base');

module.exports = class UnknownCommandCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unknown-command',
			group: 'util',
			memberName: 'unknown-command',
			description: 'Displays help information for when an unknown command is used.',
			examples: ['unknown-command kickeverybodyever'],
			unknown: true,
			hidden: true
		});
	}

	run(msg) {
		return msg.reply(msg.client.i18n.__('Unknown command. Use %s to view the command list.', msg.anyUsage('help', msg.guild ? undefined : null, msg.guild ? undefined : null )));
	}
};
