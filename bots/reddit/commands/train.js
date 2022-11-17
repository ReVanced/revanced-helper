export default {
	command: 'train',
	async execute(client, item, args) {
		console.log(args);
		const isAdmin = await client
			.getSubreddit('revancedapp')
			.getModerators({ name: item.author.name });

		if (!isAdmin[0])
			return client.getComment(item.id).reply('You\'re not an admin.');
		if (!args[0])
			return client.getComment(item.id).reply('You didn\'t specifiy the label!');
		const isComment = item.parent_id.split('_')[0] === 't1';
		if (isComment) {
			const commentData = (await client.getComment(item.parent_id).fetch())
				.body;
			client.helper.sendTrainData(commentData, args[0].toUpperCase());
		} else {
			if (!args[1])
				return client
					.getComment(item.id)
					.reply(
						'You didn\'t specifiy whether if title or description should be sent!'
					);
			const postData = await client.getSubmission(item.parent_id).fetch();

			client.helper.sendTrainData(
				args[1] === 'title' ? postData.title : postData.selftext,
				args[0].toUpperCase()
			);
		}

		return client
			.getComment(item.id)
			.reply('Sent the training data to the server.');
	}
};
