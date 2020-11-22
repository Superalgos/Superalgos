pragma solidity 0.5.4;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./IAlgoMiner.sol";
import "./ERC20TokenHolder.sol";
import "./AlgoSystemRole.sol";
import "./AlgoCoreTeamRole.sol";

contract AlgoFees is ERC20TokenHolder, AlgoSystemRole, AlgoCoreTeamRole {
    using SafeERC20 for IERC20;

    uint256 private constant CAT_0_VALUE_PROPORTION = 1;
    uint256 private constant CAT_1_VALUE_PROPORTION = 10;
    uint256 private constant CAT_2_VALUE_PROPORTION = 20;
    uint256 private constant CAT_3_VALUE_PROPORTION = 30;
    uint256 private constant CAT_4_VALUE_PROPORTION = 40;
    uint256 private constant CAT_5_VALUE_PROPORTION = 50;

    address[] private _miners;
    mapping(address => uint256) private _minersByAddress;

    constructor(address tokenAddress)
        ERC20TokenHolder(tokenAddress)
        AlgoSystemRole()
        AlgoCoreTeamRole()
        public {
        _miners.push(address(0)); // Reserved as a marker for unregistered miner.
    }

    function registerMiner(address minerAddress) public notTerminated onlyCoreTeam {
        require(_miners.length < 1000);
        require(_minersByAddress[minerAddress] == 0);

        IAlgoMiner algoMiner = IAlgoMiner(minerAddress);
        
        require(algoMiner.isAlgoMiner());
        
        uint8 minerCategory = algoMiner.getCategory();

        require(minerCategory <= 5);

        _minersByAddress[minerAddress] = _miners.length;
        _miners.push(minerAddress);
    }

    function unregisterMiner(address minerAddress) public notTerminated onlyCoreTeam {
        require(_miners.length > 1);

        if(_miners.length == 2) {
        
            // Just remove the only registered miner...
            _miners.pop();
            delete _minersByAddress[minerAddress];
        
        } else {
            
            if(_minersByAddress[minerAddress] != _miners.length) {
                // Move the latest miner to the gap... 
                _miners[_minersByAddress[minerAddress]] = _miners[_miners.length - 1];
            }

            _miners.pop();
            delete _minersByAddress[minerAddress];
        }
    }

    function mine() public notTerminated onlySystem {
        require(_miners.length > 1);

        uint256 currentFeesBalance = _token.balanceOf(address(this));

		require(currentFeesBalance > 0);

        // Count how many ENABLED miners we have for each category...
        uint256[6] memory miners;
        uint256 minerCount = _miners.length;

        for(uint256 i = 1; i < minerCount; i++) {
            IAlgoMiner algoMiner = IAlgoMiner(_miners[i]);

            if(!algoMiner.isMining()) continue;

            uint8 minerCategory = algoMiner.getCategory();

            if(minerCategory == 0) {
                miners[0]++;
            } else if(minerCategory == 1) {
                miners[1]++;
            } else if(minerCategory == 2) {
                miners[2]++;
            } else if(minerCategory == 3) {
                miners[3]++;
            } else if(minerCategory == 4) {
                miners[4]++;
            } else if(minerCategory == 5) {
                miners[5]++;
            }            
        }

        // Calculate the fee to pay per miner according to its category...
        uint256 totalProportion = CAT_0_VALUE_PROPORTION * miners[0] +
            CAT_1_VALUE_PROPORTION * miners[1] +
            CAT_2_VALUE_PROPORTION * miners[2] +
            CAT_3_VALUE_PROPORTION * miners[3] +
            CAT_4_VALUE_PROPORTION * miners[4] +
            CAT_5_VALUE_PROPORTION * miners[5];
        
        uint256[6] memory feePerMiner;

        feePerMiner[0] = currentFeesBalance * CAT_0_VALUE_PROPORTION / totalProportion;
        feePerMiner[1] = currentFeesBalance * CAT_1_VALUE_PROPORTION / totalProportion;
        feePerMiner[2] = currentFeesBalance * CAT_2_VALUE_PROPORTION / totalProportion;
        feePerMiner[3] = currentFeesBalance * CAT_3_VALUE_PROPORTION / totalProportion;
        feePerMiner[4] = currentFeesBalance * CAT_4_VALUE_PROPORTION / totalProportion;
        feePerMiner[5] = currentFeesBalance * CAT_5_VALUE_PROPORTION / totalProportion;

        // Transfer the fees to ENABLED miners...
        for(uint256 i = 1; i < minerCount; i++) {
            IAlgoMiner algoMiner = IAlgoMiner(_miners[i]);

            if(!algoMiner.isMining()) continue;

            uint8 minerCategory = algoMiner.getCategory();

			_token.safeTransfer(algoMiner.getMiner(), feePerMiner[minerCategory]);
        }
    }

    function terminate() public onlyCoreTeam {
        _terminate();
    }

    function getMinerCount() public view returns (uint256) {
        return _miners.length - 1;
    }

    function getMinerByIndex(uint256 index) public view returns (address) {
        return _miners[index + 1];
    }
}