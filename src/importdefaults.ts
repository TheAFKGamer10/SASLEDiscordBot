const env = require('dotenv').config();
import fs from 'fs';
const { Client, IntentsBitField, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const client = new Client(
    {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
        ],
        PermissionFlagsBits: [
            PermissionFlagsBits.ManageNicknames,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageGuild,
            PermissionFlagsBits.ManageMessages,
        ],
        disableEveryone: false,
    }
);

export { env, client, fs, EmbedBuilder };