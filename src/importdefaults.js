const env = require('dotenv').config();
const { Client, IntentsBitField, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    PermissionFlagsBits: [
        PermissionFlagsBits.ManageNicknames,
    ],
});

module.exports = {
    client,
    EmbedBuilder,
    env
};