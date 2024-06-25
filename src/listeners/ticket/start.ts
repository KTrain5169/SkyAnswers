import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { ComponentType, ButtonStyle, GuildChannel } from "discord.js";
import { isTicket, setTicketOpen } from "../../lib/ticket.js";
import { notSkyClient } from "../../preconditions/notPublic.js";
import { pinTop } from "./maintain.js";

/** Requires the user to choose a category for their ticket */
@ApplyOptions<Listener.Options>({
  event: Events.ChannelCreate,
})
export class UserEvent extends Listener<typeof Events.ChannelCreate> {
  public override async run(channel: GuildChannel) {
    if (!isTicket(channel)) return;
    await pinTop(channel);

    if (notSkyClient(channel.guildId)) return;

    // TODO: Adapt for Polyforst
    await channel.send({
      content: "What is your ticket about? You must click on one to continue.",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              label: "Mods aren't updating",
              style: ButtonStyle.Primary,
              customId: "ticketCategorize|modsUpdating",
            },
          ],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              label: "I'm crashing",
              style: ButtonStyle.Primary,
              customId: "ticketCategorize|crash",
            },
            {
              type: ComponentType.Button,
              label: "I need help with the installer",
              style: ButtonStyle.Primary,
              customId: "ticketCategorize|install",
            },
            {
              type: ComponentType.Button,
              label: "I need help with mods",
              style: ButtonStyle.Primary,
              customId: "ticketCategorize|mods",
            },
          ],
        },
        {
          type: ComponentType.ActionRow,
          components: [
            {
              type: ComponentType.Button,
              label: "I need help with something else",
              style: ButtonStyle.Secondary,
              customId: "ticketCategorize|other",
            },
          ],
        },
      ],
    });
    await setTicketOpen(channel, false);
  }
}
