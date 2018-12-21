pragma solidity 0.4.24;

contract IAlgoMiner {
    function isAlgoMiner() public pure returns (bool);
    function getMinerType() public view returns (uint8);
    function getCategory() public view returns (uint8);
    function getMiner() public view returns (address);
    function getReferral() public view returns (address);
    function isMining() public view returns (bool);
}