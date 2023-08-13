export function checkForPerms(config, member) {
	for (const role of config.discord.modRoles) {
		if (member.roles.cache.has(role)) {
			return true;
		}
	}
	return false;
}