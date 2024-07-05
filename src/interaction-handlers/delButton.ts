import { ApplyOptions } from "@sapphire/decorators";
import {
  InteractionHandler,
  InteractionHandlerTypes,
  container,
} from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";
import { Polyfrost, SkyClient } from "../const.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ButtonHandler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    try {
      if (!interaction.inCachedGuild()) return;
      const respondedTo = interaction.customId.split("|").at(1);
      if (
        respondedTo == interaction.member.id ||
        interaction.member.permissions.has("ManageMessages") ||
        interaction.member.roles.cache.hasAny(
          SkyClient.roles.SupportTeam,
          Polyfrost.roles.SupportTeam,
        )
      )
        return interaction.message.delete();
      else
        return interaction.reply({
          content: "You don't have permission to delete this.",
          ephemeral: true,
        });
    } catch (e) {
      container.logger.warn("could not delete", interaction.message, e);
      return interaction.reply({
        content: "could not delete",
        ephemeral: true,
      });
    }
  }

  public override parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("deleteResp")) return this.none();

    return this.some();
  }
}