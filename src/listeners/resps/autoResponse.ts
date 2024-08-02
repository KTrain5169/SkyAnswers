import { getJSON } from "../../lib/data.js";

import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, container } from "@sapphire/framework";
import { Message } from "discord.js";
import { SkyClient } from "../../const.js";
import { z } from "zod";
import { isTicket } from "../../lib/ticket.js";
import { buildDeleteBtnRow } from "../../lib/builders.js";
import { isTruthy } from "remeda";

/** Sends an autoresponse for the commands and suggestions we have */
@ApplyOptions<Listener.Options>({
  event: Events.MessageCreate,
})
export class UserEvent extends Listener<typeof Events.MessageCreate> {
  public override async run(message: Message<true>) {
    const { member, channel } = message;
    if (!member) return;
    if (message.author.bot) return;

    let canAutoResp =
      channel.id == SkyClient.channels.General || // general
      channel.id == SkyClient.channels.SkyblockTalk || // skyblock talk
      channel.id == SkyClient.channels.Support || // support
      channel.id == SkyClient.channels.BotCommands || // bot commands
      isTicket(channel);
    if (member.roles.cache.has(SkyClient.roles.NoAuto)) canAutoResp = false;
    if (!canAutoResp) return;

    const responses = await findAutoresps(
      message.content,
      message.guildId == SkyClient.id,
    );
    if (responses.length > 3) return;

    await Promise.all(
      responses.map(async (resp) =>
        message.reply({
          content: resp.response,
          components: !resp.tag ? [buildDeleteBtnRow(message.author)] : [],
        }),
      ),
    );
  }
}

const AutoResp = z.object({
  triggers: z.string().array().optional(),
  skyclient: z.boolean().optional(),
  response: z.string(),
});
type AutoResp = z.infer<typeof AutoResp>;

const Resp = z.object({
  response: z.string(),
  tag: z.boolean(),
});
type Resp = z.infer<typeof Resp>;

export async function findAutoresps(message: string, isSkyClient: boolean) {
  let resps: AutoResp[];
  try {
    resps = AutoResp.array().parse(await getJSON("botautoresponse"));
  } catch (e) {
    container.logger.error("Failed to read botautoresponse.json!", e);
    return [];
  }
  return resps
    .map((option): Resp | undefined => {
      if (option.skyclient && !isSkyClient) return;
      if (option.triggers)
        for (const re of option.triggers) {
          const matcher = new RegExp(re, "is");
          if (matcher.test(message))
            return { response: option.response, tag: false };
        }
      return;
    })
    .filter(isTruthy);
}
