export default {
  data: {
    name: 'fb-like'
  },
  async execute(helper, config, interaction) {
    console.log(config.discord.trainRole)
    if (
      interaction.member.roles.highest.comparePositionTo(
        config.discord.trainRole
      ) < 0
    )
      return interaction.reply({
        content: 'You don\'t have the permission to do this.',
        ephemeral: true
      });
    // FIXME: somehow get the intent?
    // maybe storing in a collection and fetching the msg id with its label?
    /*  
      helper.sendTrainData(interactedMessage, i.values[0]);

      i.reply({ content: 'Sent training data to server.', ephemeral: true });
    */
    interaction.reply({
      content: 'Feature currently not available. Please use the dislike button.',
      ephemeral: true
    })
  }
};
