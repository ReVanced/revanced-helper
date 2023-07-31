export function checkForPerms(config, member) {
	for (const role in config.discord.trainRoles) {
		if (member.roles.cache.get(role)) {
			return true;
		}
	}
	return false;
}