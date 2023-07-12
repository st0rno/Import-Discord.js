const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingger')
		.setDescription('Replies with Pong!')
		/*.addStringOption(option =>
			option 
				.setName('name')
				.setDescription('name')
				.setRequired(true)
		)*/,
	async execute(interaction) {
		await interaction.reply('Pingger!');

		//const channel = interaction.guild.channels.cache.find(channel => channel.name === interaction.options.getString('name') && channel.type === 0);
		//const category = interaction.guild.channels.cache.find(channel => channel.name === interaction.options.getString('name') && channel.type === 4);

		/*console.log('channel:');
		console.log(channel);
		console.log('category:');
		console.log(category);

		await interaction.reply(
			(channel ?? false) 
				? (category ?? false) 
					? 'both'
					: 'only channel' 
				: (category ?? false) 
					? 'only category'
					: 'nothin\''
		);*/
	},
};