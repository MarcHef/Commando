const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__${this.client.i18n.__('Command')} **${commands[0].name}**:__ ${this.client.i18n.__(commands[0].description)}
						${commands[0].guildOnly ? ' ('+this.client.i18n.__('Usable only in servers')+')' : ''}
						${commands[0].nsfw ? ' ('+this.client.i18n.__('NSFW')+')' : ''}
					`}

					**${this.client.i18n.__('Format')}:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**${this.client.i18n.__('Aliases')}:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**${this.client.i18n.__('Group')}:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**${this.client.i18n.__('Details')}:** ${this.client.i18n.__(commands[0].details)}`;
				if(commands[0].examples) help += `\n**${this.client.i18n.__('Examples')}:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply(msg.client.i18n.__('Sent you a DM with information.')));
				} catch(err) {
					messages.push(await msg.reply(msg.client.i18n.__('Unable to send you the help DM. You probably have DMs disabled.')));
				}
				return messages;
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(msg.client, commands, 'commands'));
			} else {
				return msg.reply(msg.client.i18n.__('Unknown command. Use %s to view the command list.', msg.usage(null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined )));
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(stripIndents`
					${msg.client.i18n.__('To run a command in %s, use %s. For example, %s.', msg.guild ? msg.guild.name : msg.client.i18n.__('any server'), Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user), Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user))}
					
					${msg.client.i18n.__('To run a command in this DM, simply use %s with no prefix.', Command.usage('command', null, null))}

					${msg.client.i18n.__('Use %s to view detailed information about a specific command.', this.usage('<command>', null, null))}
					${msg.client.i18n.__('Use %s to view a list of *all* commands, not just available ones.', this.usage('all', null, null))}

					__**${showAll ? msg.client.i18n.__('All commands') : `${msg.client.i18n.__('Available commands in %s', msg.guild || 'DM')}`}**__

					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${msg.client.i18n.__(cmd.description)}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply(msg.client.i18n.__('Sent you a DM with information.')));
			} catch(err) {
				messages.push(await msg.reply(msg.client.i18n.__('Unable to send you the help DM. You probably have DMs disabled.')));
			}
			return messages;
		}
	}
};
