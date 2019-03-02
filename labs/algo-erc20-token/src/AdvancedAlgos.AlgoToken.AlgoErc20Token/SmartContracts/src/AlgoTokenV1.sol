pragma solidity 0.5.4;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";

contract AlgoTokenV1 is ERC20, ERC20Detailed, ERC20Pausable {

    uint256 public constant INITIAL_SUPPLY = 1000000000 * (10 ** uint256(18));

    constructor()
        ERC20Pausable()
        ERC20Detailed("Algos", "ALGO", 18)
        public
    {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
