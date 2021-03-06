import { command } from "knub";
import { MutesPluginType } from "../types";
import { sendSuccessMessage } from "../../../pluginUtils";
import { resolveMember } from "../../../utils";

export const ClearMutesWithoutRoleCmd = command<MutesPluginType>()({
  trigger: "clear_mutes_without_role",
  permission: "can_cleanup",
  description: "Clear dangling mutes for members whose mute role was removed by other means",

  async run({ pluginData, message: msg }) {
    const activeMutes = await pluginData.state.mutes.getActiveMutes();
    const muteRole = pluginData.config.get().mute_role;
    if (!muteRole) return;

    await msg.channel.createMessage("Clearing mutes from members that don't have the mute role...");

    let cleared = 0;
    for (const mute of activeMutes) {
      const member = await resolveMember(pluginData.client, pluginData.guild, mute.user_id);
      if (!member) continue;

      if (!member.roles.includes(muteRole)) {
        await pluginData.state.mutes.clear(mute.user_id);
        cleared++;
      }
    }

    sendSuccessMessage(pluginData, msg.channel, `Cleared ${cleared} mutes from members that don't have the mute role`);
  },
});
