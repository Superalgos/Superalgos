pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./IAlgoMiner.sol";
import "./ERC20TokenHolder.sol";
import "./AlgoCoreTeamRole.sol";

contract AlgoPool is ERC20TokenHolder, AlgoCoreTeamRole {
    using SafeERC20 for IERC20;

    uint256 public constant TOKEN_FACTOR = 10 ** uint256(18);
    uint256 public constant CAT_0_VALUE = 100000 * TOKEN_FACTOR;
    uint256 public constant CAT_1_VALUE = 1000000 * TOKEN_FACTOR;
    uint256 public constant CAT_2_VALUE = 2 * 1000000 * TOKEN_FACTOR;
    uint256 public constant CAT_3_VALUE = 3 * 1000000 * TOKEN_FACTOR;
    uint256 public constant CAT_4_VALUE = 4 * 1000000 * TOKEN_FACTOR;
    uint256 public constant CAT_5_VALUE = 5 * 1000000 * TOKEN_FACTOR;

    uint16 private _poolType;
    mapping(address => bool) _fundedMiners;

    constructor(uint16 poolType, address tokenAddress)
        ERC20TokenHolder(tokenAddress)
        AlgoCoreTeamRole()
        public {
        _poolType = poolType;
    }

    function trasferToMiner(address minerAddress) public notTerminated onlyCoreTeam {
        require(!_fundedMiners[minerAddress]);

        IAlgoMiner algoMiner = IAlgoMiner(minerAddress);
        
        require(algoMiner.isAlgoMiner());
        
        uint8 minerCategory = algoMiner.getCategory();

        require(minerCategory >= 0 && minerCategory <= 5);

        uint256 value = 0;

        if(minerCategory == 0) {
            value = CAT_0_VALUE;
        } else if(minerCategory == 1) {
            value = CAT_1_VALUE;
        } else if(minerCategory == 2) {
            value = CAT_2_VALUE;
        } else if(minerCategory == 3) {
            value = CAT_3_VALUE;
        } else if(minerCategory == 4) {
            value = CAT_4_VALUE;
        } else if(minerCategory == 5) {
            value = CAT_5_VALUE;
        }

        require(value > 0);

        _fundedMiners[minerAddress] = true;
        _token.safeTransfer(minerAddress, value);
    }

    function terminate() public onlyCoreTeam {
        _terminate();
    }
}
