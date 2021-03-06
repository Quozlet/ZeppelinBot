import { PluginData } from "knub";
import { ModActionsPluginType } from "../types";
import { User, Message, Member } from "eris";
import { UnknownUser, asSingleLine } from "src/utils";
import { sendErrorMessage, sendSuccessMessage, hasPermission } from "src/pluginUtils";
import { formatReasonWithAttachments } from "./formatReasonWithAttachments";
import { MutesPlugin } from "src/plugins/Mutes/MutesPlugin";
import humanizeDuration from "humanize-duration";

export async function actualUnmuteCmd(
  pluginData: PluginData<ModActionsPluginType>,
  user: User | UnknownUser,
  msg: Message,
  args: { time?: number; reason?: string; mod?: Member },
) {
  // The moderator who did the action is the message author or, if used, the specified -mod
  let mod = msg.author;
  let pp = null;

  if (args.mod) {
    if (!hasPermission(pluginData, "can_act_as_other", { message: msg, channelId: msg.channel.id })) {
      sendErrorMessage(pluginData, msg.channel, "No permission for -mod");
      return;
    }

    mod = args.mod.user;
    pp = msg.author;
  }

  const reason = formatReasonWithAttachments(args.reason, msg.attachments);

  const mutesPlugin = pluginData.getPlugin(MutesPlugin);
  const result = await mutesPlugin.unmuteUser(user.id, args.time, {
    modId: mod.id,
    ppId: pp && pp.id,
    reason,
  });

  // Confirm the action to the moderator
  if (args.time) {
    const timeUntilUnmute = args.time && humanizeDuration(args.time);
    sendSuccessMessage(
      pluginData,
      msg.channel,
      asSingleLine(`
        Unmuting **${user.username}#${user.discriminator}**
        in ${timeUntilUnmute} (Case #${result.case.case_number})
      `),
    );
  } else {
    sendSuccessMessage(
      pluginData,
      msg.channel,
      asSingleLine(`
        Unmuted **${user.username}#${user.discriminator}**
        (Case #${result.case.case_number})
      `),
    );
  }
}
