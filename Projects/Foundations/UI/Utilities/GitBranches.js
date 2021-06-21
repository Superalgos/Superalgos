function newFoundationsUtilitiesGitBranches() {
    let thisObject = {
        getBranchLabel: getBranchLabel
    }

    return thisObject

    function getBranchLabel(branch) {
        let branchLabel
        switch (branch) {
            case 'master': {
                branchLabel = 'Master'
                break
            }
            case 'develop': {
                branchLabel = 'Develop'
                break
            }
            case 'plugins-docs': {
                branchLabel = 'Plugins-Docs'
                break
            }
            case 'next-version': {
                branchLabel = 'Next-Version'
                break
            }
        }
        return branchLabel 
    }    
}