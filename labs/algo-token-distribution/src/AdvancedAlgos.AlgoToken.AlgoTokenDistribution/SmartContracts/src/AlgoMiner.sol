pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./IAlgoMiner.sol";
import "./AlgoSystemRole.sol";
import "./AlgoCoreTeamRole.sol";
import "./AlgoSupervisorRole.sol";

contract AlgoMiner is AlgoSystemRole, AlgoCoreTeamRole, AlgoSupervisorRole, IAlgoMiner {
    using SafeERC20 for IERC20;

    uint256 public constant DAYS_PER_YEAR = 365;

    enum MinerState {
        Deactivated,
        Activated,
        Suspended,
        Stopped
    }

    uint16 private _minerType;
    uint8 private _category;
    address private _miner;
    IERC20 private _token;

    MinerState private _state;
    bool private _mining;
    uint8 private _currentYear;
    uint16 private _currentDay;
    uint256 private _currentYearSupply;

    constructor(uint16 minerType, uint8 category, address ownerAddress, address tokenAddress)
        AlgoSystemRole()
        AlgoCoreTeamRole()
        AlgoSupervisorRole()
        public {
        
        require(category >= 0 && category <= 5);

        _minerType = minerType;
        _category = category;
        _miner = ownerAddress;
        _token = IERC20(tokenAddress);
    }

    modifier onlyMiner() {
        require(msg.sender == _miner);
        _;
    }
    
    function activateMiner() public onlyCoreTeam {
        require(_state == MinerState.Deactivated);

        if(_currentYearSupply == 0) {
            uint256 currentBalance = _token.balanceOf(address(this));

            require(currentBalance != 0);

            _currentYearSupply = currentBalance / 2;
        }

        _state = MinerState.Activated;
    }

    function deactivateMiner() public onlyCoreTeam {
        require(_state != MinerState.Deactivated);
        
        _state = MinerState.Deactivated;
        _mining = false;
    }

    function migrateMiner(address newMinerAddress) public onlyCoreTeam {
        require(_state == MinerState.Deactivated);

        _token.safeTransfer(newMinerAddress, _token.balanceOf(address(this)));
    }

    function pauseMining() public onlySupervisor {
        require(_state == MinerState.Activated);
        
        _state = MinerState.Suspended;
    }

    function resumeMining() public onlySupervisor {
        require(_state == MinerState.Suspended);

        _state = MinerState.Activated;
    }

    function stopAndRemoveOwnership() public onlySupervisor {
        require(_state != MinerState.Stopped);
        
        _state = MinerState.Stopped;
        _mining = false;
        _miner = address(0);
    }

    function resetMiner(address newOwnerAddress) public onlySupervisor {
        require(_state == MinerState.Stopped);

        _state = MinerState.Activated;
        _miner = newOwnerAddress;
    }

    function startMining() public onlyMiner {
        require(_state == MinerState.Activated);
        require(!_mining);
        
        _mining = true;
    }

    function stopMining() public onlyMiner {
        require(_state == MinerState.Activated);
        require(_mining);
        
        _mining = false;
    }

    function mine() public onlySystem {
        require(_state == MinerState.Activated);
        require(_mining);

        if(_currentDay == 0) {
            _currentYear = 1;
            _currentDay = 1;
        } else {
            _currentDay++;
            if(_currentDay == (DAYS_PER_YEAR + 1)) {
                _currentYear++;
                _currentDay = 1;
                _currentYearSupply = _currentYearSupply / 2;
            }
        }

        uint256 tokens = _currentYearSupply / DAYS_PER_YEAR;

        require(tokens > 0);

        _token.safeTransfer(_miner, tokens);
    }

    function isAlgoMiner() public pure returns (bool) {
        return true;
    }

    function getCategory() public view returns (uint8) {
        return _category;
    }

    function isMining() public view returns (bool) {
        return _state == MinerState.Activated && _mining;
    }

    function getMiner() public view returns (address) {
        return _miner;
    }
}
