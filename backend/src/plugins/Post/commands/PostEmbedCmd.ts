import { postCmd } from "../types";
import { commandTypeHelpers as ct } from "../../../commandTypes";
import { actualPostCmd } from "../util/actualPostCmd";
import { sendErrorMessage } from "src/pluginUtils";
import { Embed } from "eris";
import { isValidEmbed, trimLines } from "src/utils";
import { formatContent } from "../util/formatContent";
import { parseColor } from "../../../utils/parseColor";
import { rgbToInt } from "../../../utils/rgbToInt";

export const PostEmbedCmd = postCmd({
  trigger: "post_embed",
  permission: "can_post",

  signature: {
    channel: ct.textChannel(),
    maincontent: ct.string({ catchAll: true }),

    title: ct.string({ option: true }),
    content: ct.string({ option: true }),
    color: ct.string({ option: true }),
    raw: ct.bool({ option: true, isSwitch: true, shortcut: "r" }),

    schedule: ct.string({ option: true }),
    repeat: ct.delay({ option: true }),
    "repeat-until": ct.string({ option: true }),
    "repeat-times": ct.number({ option: true }),
  },

  async run({ message: msg, args, pluginData }) {
    const content = args.content || args.maincontent;

    if (!args.title && !content) {
      sendErrorMessage(pluginData, msg.channel, "Title or content required");
      return;
    }

    let color = null;
    if (args.color) {
      const colorRgb = parseColor(args.color);
      if (colorRgb) {
        color = rgbToInt(colorRgb);
      } else {
        sendErrorMessage(pluginData, msg.channel, "Invalid color specified");
        return;
      }
    }

    let embed: Embed = { type: "rich" };
    if (args.title) embed.title = args.title;
    if (color) embed.color = color;

    if (content) {
      if (args.raw) {
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          sendErrorMessage(pluginData, msg.channel, `Syntax error in embed JSON: ${e.message}`);
          return;
        }

        if (!isValidEmbed(parsed)) {
          sendErrorMessage(pluginData, msg.channel, "Embed is not valid");
          return;
        }

        embed = Object.assign({}, embed, parsed);
      } else {
        embed.description = formatContent(content);
      }
    }

    if (args.content) {
      const prefix = pluginData.guildConfig.prefix || "!";
      msg.channel.createMessage(
        trimLines(`
        <@!${msg.author.id}> You can now specify an embed's content directly at the end of the command:
        \`${prefix}edit_embed -title "Some title" content goes here\`
        The \`-content\` option will soon be removed in favor of this.
      `),
      );
    }

    actualPostCmd(pluginData, msg, args.channel, { embed }, args);
  },
});
