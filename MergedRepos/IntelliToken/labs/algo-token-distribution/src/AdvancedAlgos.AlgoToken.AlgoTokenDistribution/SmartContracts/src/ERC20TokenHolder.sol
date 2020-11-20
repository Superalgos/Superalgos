pragma solidity 0.5.4;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./Terminable.sol";

contract ERC20TokenHolder is Terminable {
    using SafeERC20 for IERC20;

    IERC20 internal _token;

    constructor(address tokenAddress) Terminable() internal {
        _token = IERC20(tokenAddress);
    }

    function _terminate() internal {
        uint256 currentBalance = _token.balanceOf(address(this));
        if(currentBalance > 0) {
            _token.safeTransfer(_creator, currentBalance);
        }
        Terminable._terminate();
    }
}