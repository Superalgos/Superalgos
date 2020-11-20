import { Ecosystem } from '../models'

let teamCache = new Map()
export default async function getDevTeamHost(devTeamName, accessKey, ownerKey) {
    let host
    if (accessKey) {
        host = teamCache.get(devTeamName + '.accessKey')
    } else {
        host = teamCache.get(devTeamName + '.ownerKey')
    }
    if (host && (host.accessKey === accessKey || host.ownerKey === ownerKey)) {
        return host
    } else {
        let ecosystem = await Ecosystem.find()

        for (var i = 0; i < ecosystem.length; i++) {
            for (var j = 0; j < ecosystem[i].devTeams.length; j++) {
                if (ecosystem[i].devTeams[j].codeName.toLowerCase() === devTeamName.toLowerCase()) {
                    if (ecosystem[i].devTeams[j].host.accessKey === accessKey) {
                        teamCache.set(devTeamName + '.accessKey', ecosystem[i].devTeams[j].host)
                        return ecosystem[i].devTeams[j].host
                    }
                    if (ecosystem[i].devTeams[j].host.ownerKey === ownerKey) {
                        teamCache.set(devTeamName + '.ownerKey', ecosystem[i].devTeams[j].host)
                        return ecosystem[i].devTeams[j].host
                    }
                }
            }
        }

    }
}
