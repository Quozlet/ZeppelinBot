import * as t from "io-ts";
import { tNullable, tPartialDictionary } from "../../utils";
import { BasePluginType, command } from "knub";
import { GuildMemberTimezones } from "../../data/GuildMemberTimezones";
import { tValidTimezone } from "../../utils/tValidTimezone";
import { defaultDateFormats } from "./defaultDateFormats";

export const ConfigSchema = t.type({
  timezone: tValidTimezone,
  date_formats: tNullable(tPartialDictionary(t.keyof(defaultDateFormats), t.string)),
  can_set_timezone: t.boolean,
});
export type TConfigSchema = t.TypeOf<typeof ConfigSchema>;

export interface TimeAndDatePluginType extends BasePluginType {
  config: TConfigSchema;
  state: {
    memberTimezones: GuildMemberTimezones;
  };
}

export const timeAndDateCmd = command<TimeAndDatePluginType>();
