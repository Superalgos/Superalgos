pragma solidity 0.5.4;

import "openzeppelin-solidity/contracts/access/Roles.sol";

contract AlgoSupervisorRole {
    using Roles for Roles.Role;

    Roles.Role private _supervisors;

    constructor () internal {
        _addSupervisor(msg.sender);
    }

    modifier onlySupervisor() {
        require(isSupervisor(msg.sender));
        _;
    }

    function isSupervisor(address account) public view returns (bool) {
        return _supervisors.has(account);
    }

    function addSupervisor(address account) public onlySupervisor {
        _addSupervisor(account);
    }

    function renounceSupervisor() public {
        _removeSupervisor(msg.sender);
    }

    function _addSupervisor(address account) internal {
        _supervisors.add(account);
    }

    function _removeSupervisor(address account) internal {
        _supervisors.remove(account);
    }
}
