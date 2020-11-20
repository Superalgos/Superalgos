pragma solidity 0.5.4;

import "openzeppelin-solidity/contracts/access/Roles.sol";

contract AlgoSystemRole {
    using Roles for Roles.Role;

    Roles.Role private _systemMembers;

    constructor () internal {
        _addSystem(msg.sender);
    }

    modifier onlySystem() {
        require(isSystem(msg.sender));
        _;
    }

    function isSystem(address account) public view returns (bool) {
        return _systemMembers.has(account);
    }

    function addSystem(address account) public onlySystem {
        _addSystem(account);
    }

    function renounceSystem() public {
        _removeSystem(msg.sender);
    }

    function _addSystem(address account) internal {
        _systemMembers.add(account);
    }

    function _removeSystem(address account) internal {
        _systemMembers.remove(account);
    }
}
