const { client, EmbedBuilder, env } = require("../importdefaults");
const rules = require("../../config/rules.config.json");

module.exports = async (interaction) => {
    const { commandName, options } = interaction;
    if (options.getString('category') === 'rulesoverview' && options.getString('rulenumber') !== null) {
        interaction.reply({ content: 'You can not select a rule from Rules Overview. Select a specific catogory to use this option.', ephemeral: true });
        return;
    }
    if (options.getChannel('chanel') !== null) {
        await interaction.deferReply({ ephemeral: true });
    } else {
        await interaction.deferReply();
    }

    let rulesembed = new EmbedBuilder()
    let rulelist = [];
    let keysUpper = [];
    let keysLower = [];
    let category = options.getString('category');
    let LookingForRule = options.getString('rulenumber');
    let outputrule = [];
    let ListToObject = [];

    if (options.getString('category') !== 'rulesoverview') {
        Object.keys(rules).forEach(key => {
            if (!key.includes("_") && !key.includes("Overveiw")) {
                rulelist.push(key);
            }
            if (!key.includes("_") && !key.includes("Overveiw")) {
                keysUpper.push(key);
                keysLower.push(key.toLowerCase().replace(/ /g, ''));
            }
        });

        rules[keysUpper[keysLower.indexOf(category)]].forEach(element => {
            if (element.name.toLowerCase().replace(/ /g, '') == LookingForRule) {
                outputrule.push(
                    {
                        name: element.name,
                        value: element.value,
                        inline: element.inline
                    }
                );
            }
            ListToObject.push(
                {
                    name: element.name,
                    value: element.value,
                    inline: element.inline
                }
            );
        });
    }

    if (options.getString('rulenumber') !== null) {
        rulesembed = new EmbedBuilder()
            .setTitle(`**${outputrule[0].name}**`)
            .setDescription(outputrule[0].value)
            .setColor(0xFF470F)
            .setFooter({ text: 'If you violate the rules you agree to the consequences.' })
            .setTimestamp();
    } else {
        if (options.getString('category') === 'rulesoverview') {
            rulesembed = new EmbedBuilder()
                .setTitle('**Rules**')
                .addFields(
                    rules["Discord Chat Rules Overveiw"]
                )
                .addFields({ name: '\u200B', value: '\u200B' }) // Break bewtween server and discord rules.
                .addFields(
                    rules["FiveM Server Rules Overveiw"]
                )
                .setColor(0xFF470F)
                .setFooter({ text: 'If you violate the rules you agree to the consequences.' })
                .setTimestamp();
        } else {
            rulesembed = new EmbedBuilder()
                .addFields(
                    ListToObject
                )
                .setColor(0xFF470F)
                .setFooter({ text: 'If you violate the rules you agree to the consequences.' })
                .setTimestamp();
        }
    }

    if (options.getChannel('chanel') === null) {
        interaction.editReply({ embeds: [rulesembed] });
    } else {
        client.channels.cache.get(options.getChannel('chanel').id).send({ embeds: [rulesembed] });
        interaction.editReply({ content: 'Embed sent!', ephemeral: true });
    }

    const commandused = `/${commandName} category:${options.getString('category')} rule:${options.getString('rulenumber') !== null ? options.getString('rulenumber') : 'null'} chanel:${options.getChannel('chanel') !== null ? options.getChannel('chanel').name : 'null'}`;
    const logembed = new EmbedBuilder()
        .setTitle("Member Used Embed")
        .setDescription(`<@${interaction.member.user.id}> used \`\`\`${commandused}\`\`\` in <#${interaction.channel.id}>.`)
        .setColor(0x0099FF)
        .setTimestamp();
    client.channels.cache.get(env.parsed.LOG_CHANNEL_ID).send({ embeds: [logembed] });
}