import decancer from 'decancer';

export default async function cureUsername(member) {
    let toCure = member.user.username;
    if (member.nickname) toCure = member.nickname;

    if (!/^[\x20-\x7D]+$/.test(toCure)) {
        // Cure username/nickname if there's non-ascii characters.

        let curedName = decancer(toCure).toString();
        
        // If the output is empty, rename them to "ReVanced member".
        if (/^\s*$/.test(curedName)) curedName = 'ReVanced member';

        member.setNickname(curedName);
    }
}