import {
  type ChannelTypes,
  isGuildMember,
  isTextChannel,
} from "@sapphire/discord.js-utilities";
import { container } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { type FirstArgument, type Nullish, sleep } from "@sapphire/utilities";
import { Message, roleMention, TextChannel } from "discord.js";
import memoize from "memoize";
import { formatChannel } from "./logHelper.js";
import { DevServer, Polyfrost, SkyClient, SupportTeams } from "../const.js";

export async function setTicketOpen(
  channel: ChannelTypes,
  open: boolean = true,
) {
  if (open == undefined || open == null)
    throw new Error(`open undefined WHY IS THIS HAPPENING`);
  const header = `${open ? "Opening" : "Closing"} ${formatChannel(channel)}`;
  if (!isTicket(channel)) {
    container.logger.warn(header, "Not a ticket");
    return;
  }

  const owner = await getTicketOwner(channel);
  if (owner) {
    container.logger.info(header, "for", owner);
    await channel.permissionOverwrites.edit(owner, { SendMessages: open });
  } else container.logger.warn(header, "Failed to find owner");
}

async function _getTicketTop(ticket: ChannelTypes) {
  if (!isTicket(ticket)) return;

  await sleep(Time.Second * 2);
  const msgs = await ticket.messages.fetch({ limit: 1, after: "0" });
  const msg = msgs.first();
  if (!msg || !msg.author.bot) return;
  return msg;
}
export const getTicketTop = memoize(_getTicketTop, {
  cacheKey: ([channel]) => channel.id,
});

const mentionRegex = /<@!?(?<id>\d{17,20})>/;
async function _getTicketOwner(ticket: ChannelTypes) {
  if (!isTicket(ticket)) return;

  const pin = await getTicketTop(ticket);
  if (!pin) return;

  const contentMatch = pin.content.match(mentionRegex);
  if (contentMatch) return contentMatch[1];

  const embedMatch = pin.embeds[0]?.description?.match(mentionRegex);
  if (embedMatch) return embedMatch[1];

  return;
}
export const getTicketOwner = memoize(_getTicketOwner, {
  cacheKey: ([channel]) => channel.id,
});

export function isTicket(
  channel: ChannelTypes | Nullish,
): channel is TextChannel {
  if (!isTextChannel(channel)) return false;
  if (channel.name == "ticket-logs" || channel.name == "ticket-transcripts")
    return false;
  if (channel.name.startsWith("ticket-")) return true;
  if (channel.parentId == Polyfrost.categories.BugReports) return true;
  return false;
}

export function isSupportTeam(member: FirstArgument<typeof isGuildMember>) {
  if (!isGuildMember(member)) return false;
  return (
    member.permissions.has("Administrator") ||
    member.roles.cache.hasAny(
      SkyClient.roles.SupportTeam,
      Polyfrost.roles.SupportTeam,
      DevServer.roles.SupportTeam,
    )
  );
}

export const isBumpMessage = (msg: Message) =>
  msg.author.id == msg.client.user.id &&
  msg.embeds.some((embed) => embed.title == "Do you still need help?");

export function isStaffPing(msg: Message) {
  const { guild } = msg;
  if (!guild) return false;
  const support = SupportTeams[guild.id];
  if (!support) return false;
  return (
    msg.author.id == msg.client.user.id &&
    msg.content.startsWith(roleMention(support))
  );
}
