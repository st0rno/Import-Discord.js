const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const request = require('request-promise');

async function getChannelIdByName(interaction, channelName, channelType, categoryName) {
    const channelTypeInt = (channelType == 'GuildTextChat') ? 0 : null;
    var category = await interaction.guild.channels.cache.find(channel => channel.name === categoryName && channel.type === 4);
    if (category == undefined) {
        //console.log('creating category');
        category = await interaction.guild.channels.create({
            name: categoryName,
            type: 4,
        }); 
        //console.log('created category');
    }
    //console.log('categoryCreatedOrExists');
    //console.log(category);
    var channel = await interaction.guild.channels.cache.find(channel => channel.name === channelName && channel.type === channelTypeInt);
    if (channel == undefined || channel.parent.id != category.id) {
        //console.log('creating channel');
        channel = await interaction.guild.channels.create({
            name: channelName,
            type: 0,
            parent: category.id,
        }); 
        //console.log('created channel');
    }
    //console.log('channelCreatedOrExists');
    //console.log(channel);
    return await channel.id;
}

async function getJSONFromUrl(url) {
    return await request.get(url, async function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const jsonContent = body.toString();
            //console.log('josnno.');
            //console.log(jsonContent);
            return await jsonContent;
        }
    });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('import')
		.setDescription('imports messages')
        .addSubcommand(subcommand => 
            subcommand
                .setName('web')
                .setDescription('import messages from a file on the web')
                .addStringOption(option =>
                    option 
                        .setName('web')
                        .setDescription('the url on the web of the file')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('file')
                .setDescription('imports messages from attached file')
                .addAttachmentOption(option =>
                    option 
                        .setName('file')
                        .setDescription('the json file')
                        .setRequired(true)
                )
        ),

	async execute(interaction) {
        const subComm = interaction.options.getSubcommand();
        var fileUrl = null;

        if(subComm === 'file') {
            const file = interaction.options.getAttachment('file');
            (!file) ? await interaction.reply('no attached file found') :
            fileUrl = file.url;
        } else {
            fileUrl = interaction.options.getString('web');
        }
        if (fileUrl) { 
            const jsonStringContent = await getJSONFromUrl(fileUrl);
            const jsonContent = JSON.parse(jsonStringContent);
            //console.log('jsone2?');
            //console.log(jsonContent['channel']);
            const channelId = await getChannelIdByName(interaction, jsonContent['channel']['name'], jsonContent['channel']['type'], jsonContent['channel']['category']);
            const channelToSend = interaction.guild.channels.cache.get(channelId);
            for (var i in jsonContent['messages']) {
                const messageData = jsonContent['messages'][i];
                messageDateTimestamp = Math.floor(Date.parse(messageData['timestamp'])/1000);
                messageDateTimestampEdited = Math.floor(Date.parse(messageData['timestampEdited'])/1000);
                channelToSend.send(`<@${messageData['author']['id']}> **${messageData['author']['name']}**#*${messageData['author']['discriminator']}*\n<t:${messageDateTimestamp}:d><t:${messageDateTimestamp}:t>${((messageDateTimestampEdited ?? false) && messageDateTimestamp != messageDateTimestampEdited) ? (' (*edited <t:'+messageDateTimestampEdited+':d><t:'+messageDateTimestampEdited+':t>*)'):''}`);
                if (messageData['content'] ?? false) channelToSend.send(`${messageData['content']}`);
                var messageEmbeds  = [];
                for (var j in messageData['embeds']) {
                    const embedData = messageData['embeds'][j];
                    const newEmbed = new EmbedBuilder()
                    
                    if (embedData['color'] ?? false) newEmbed.setColor(embedData['color'])
                    if (embedData['title'] ?? false) newEmbed.setTitle(embedData['title'])
                    if (embedData['url'] ?? false) newEmbed.setURL(embedData['url'])
                    if (embedData['description'] ?? false) newEmbed.setDescription(embedData['description'])
                    if (embedData['thumbnail'] ?? false) newEmbed.setThumbnail(embedData['thumbnail'])
                    if (embedData['timestamp'] ?? false) newEmbed.setTimestamp(embedData['timestamp'])
                    if (embedData['footer'] ?? false) newEmbed.setFooter(embedData['footer'])
                    if (embedData['author'] ?? false) newEmbed.setAuthor(embedData['author'])
                    if ((embedData['fields'] ?? false) && embedData['fields'].length != 0) newEmbed.addFields(embedData['fields']);
                    if ((embedData['images'] ?? false) && embedData['images'].length != 0) newEmbed.setImage(embedData['images']);

                    messageEmbeds.push(newEmbed);
                }
                channelToSend.send({ embeds: messageEmbeds });
            }
            await interaction.reply(`done: <#${channelId}>`);
        } else { 
            await interaction.reply('no file was found'); 
        }
	},
};
