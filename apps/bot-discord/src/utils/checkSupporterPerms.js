export function checkForPerms(config, member) {
	for (const role of config.discord.trainRoles) {
		if (member.roles.cache.has(role)) {
			return true;
		}
	}
	return false;
}