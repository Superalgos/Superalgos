pragma solidity 0.4.24;

contract Terminable {

    address internal _creator;
    bool internal _terminated;

    constructor() internal {
        _creator = msg.sender;
        _terminated = false;
    }

    modifier notTerminated() {
        require(!_terminated);
        _;
    }

    function _terminate() internal {
        _terminated = true;
    }
}