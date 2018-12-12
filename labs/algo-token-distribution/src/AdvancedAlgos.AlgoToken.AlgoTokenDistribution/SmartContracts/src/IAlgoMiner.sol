pragma solidity 0.4.24;

contract IAlgoMiner {
    function isAlgoMiner() public pure returns (bool);
    function getCategory() public view returns (uint8);
    function isMining() public view returns (bool);
    function getMiner() public view returns (address);
}