import { ComponentType, InteractionType, TextInputStyle } from "discord.js";
import { activeUpdates } from "./update.js";

export const command = async (interaction) => {
  if (
    !interaction.member.roles.cache.has("799020944487612428") &&
    !interaction.member.permissions.has("Administrator")
  ) {
    return await interaction.reply({
      content: "why do you think you can do this?",
      ephemeral: true,
    });
  }

  const source = interaction.message.id;
  const modData = activeUpdates[source];
  const inputs = [
    {
      label: "Mod ID",
      customId: "id",
      value: modData.forge_id,
    },
    {
      label: "Mod URL",
      customId: "url",
    },
    {
      label: "Mod hash",
      customId: "hash",
    },
    {
      label: "Mod filename",
      customId: "file",
    },
  ];
  await interaction.showModal({
    title: "Edit the mod data",
    customId: "modalUpdate",
    components: inputs.map((i) => ({
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.TextInput,
          value: modData[i.customId],
          style: TextInputStyle.Short,
          ...i,
        },
      ],
    })),
  });
};
export const when = {
  interactionId: "editModUpdate",
  interactionType: InteractionType.MessageComponent,
};