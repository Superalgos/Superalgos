pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/access/Roles.sol";

contract AlgoCoreTeamRole {
    using Roles for Roles.Role;

    Roles.Role private _coreTeamMembers;

    constructor () internal {
        _addCoreTeam(msg.sender);
    }

    modifier onlyCoreTeam() {
        require(isCoreTeam(msg.sender));
        _;
    }

    function isCoreTeam(address account) public view returns (bool) {
        return _coreTeamMembers.has(account);
    }

    function addCoreTeam(address account) public onlyCoreTeam {
        _addCoreTeam(account);
    }

    function renounceCoreTeam() public {
        _removeCoreTeam(msg.sender);
    }

    function _addCoreTeam(address account) internal {
        _coreTeamMembers.add(account);
    }

    function _removeCoreTeam(address account) internal {
        _coreTeamMembers.remove(account);
    }
}
