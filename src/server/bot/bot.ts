import { client, fs, env } from "./importdefaults";
import { CommandInteraction } from "discord.js";
import rules from "./commands/rules";
import join from "./commands/join";
import emebedRuleFinder from "./events/emebedRuleFinder";
import forcejoin from "./commands/force-join";
import ftocomplete from "./commands/fto-complete";
import ftotrain from "./commands/fto-train";
import rp from "./commands/rp";

client.on("interactionCreate", async (interaction: CommandInteraction) => {
    const { commandName } = interaction;
    try {
        if (interaction.isAutocomplete()) {
            if (commandName === "rules") {
                emebedRuleFinder(interaction);
                return;
            }
        }
        if (commandName === "join") {
            join(interaction);
            return;
        } else if (commandName === "force-join") {
            forcejoin(interaction);
            return;
        } else if (commandName === "rules") {
            rules(interaction);
            return;
        } else if (commandName === "rp") {
            rp(interaction);
            return;
        } else if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
            // If the bot has a database connection
            if (commandName === "fto-complete") {
                ftocomplete(interaction);
                return;
            } else if (commandName === "fto-train") {
                ftotrain(interaction);
                return;
            }
        } else {
            interaction.reply({ content: "This command is not available at this time.", ephemeral: true });
        }
    } catch (error) {
        console.log(error);
    }
});

client.login(env.parsed.BOT_TOKEN).catch((error: any) => {
    console.log(error);
});

export { client }; // Export the client
