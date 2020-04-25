const ArgumentType = require('./base');
const { disambiguation } = require('../util');
const { escapeMarkdown } = require('discord.js');

class GroupArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'group');
	}

	validate(val) {
		const groups = this.client.registry.findGroups(val);
		if(groups.length === 1) return true;
		if(groups.length === 0) return false;
		return `${disambiguation(this.client, groups.map(grp => escapeMarkdown(grp.name)), 'groups', null)}\n`;
	}

	parse(val) {
		return this.client.registry.findGroups(val)[0];
	}
}

module.exports = GroupArgumentType;
