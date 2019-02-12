pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

import "./IAlgoMiner.sol";
import "./AlgoCommon.sol";
import "./ERC20TokenHolder.sol";
import "./AlgoSystemRole.sol";
import "./AlgoCoreTeamRole.sol";
import "./AlgoSupervisorRole.sol";

contract AlgoMiner is AlgoCommon, ERC20TokenHolder, AlgoSystemRole, AlgoCoreTeamRole, AlgoSupervisorRole, IAlgoMiner {
    using SafeERC20 for IERC20;

    uint256 private constant DAYS_PER_YEAR = 365;

    enum MinerType {
        PoolBased,
        NonPoolBased
    }

    enum MinerState {
        Deactivated,
        Activated,
        Suspended,
        Stopped
    }

    MinerType private _minerType;
    uint8 private _category;
    address private _miner;
    address private _referral;

    MinerState private _state;
    bool private _mining;
    uint8 private _currentYear;
    uint16 private _currentDay;
    uint256 private _currentYearSupply;

    constructor(MinerType minerType, uint8 category, address minerAccountAddress, address referralAccountAddress, address tokenAddress)
        ERC20TokenHolder(tokenAddress)
        AlgoSystemRole()
        AlgoCoreTeamRole()
        AlgoSupervisorRole()
        public {
        
        require(category >= 0 && category <= 5);
        require(minerAccountAddress != address(0));

        if(minerType == MinerType.PoolBased) {
            require(referralAccountAddress != address(0));
        }

        _minerType = minerType;
        _category = category;
        _miner = minerAccountAddress;
        _referral = referralAccountAddress;
    }

    modifier onlyMiner() {
        require(msg.sender == _miner);
        _;
    }
    
    function activateMiner() public notTerminated onlyCoreTeam {
        require(_state == MinerState.Deactivated);

        if(_minerType == MinerType.PoolBased && _currentYearSupply == 0) {

            uint256 capacity = getCapacityByCategory(_category);
            uint256 expectedBalance = capacity + capacity * 10 / 100;

            uint256 currentBalance = _token.balanceOf(address(this));

            require(currentBalance == expectedBalance);

            _currentYearSupply = capacity / 2;
        }

        _state = MinerState.Activated;
    }

    function deactivateMiner() public notTerminated onlyCoreTeam {
        require(_state != MinerState.Deactivated);
        
        _state = MinerState.Deactivated;
        _mining = false;
    }

    function migrateMiner(address newMinerAddress) public onlyCoreTeam {
        require(_state == MinerState.Deactivated);

        _token.safeTransfer(newMinerAddress, _token.balanceOf(address(this)));
    }

    function pauseMining() public notTerminated onlySupervisor {
        require(_state == MinerState.Activated);
        
        _state = MinerState.Suspended;
    }

    function resumeMining() public notTerminated onlySupervisor {
        require(_state == MinerState.Suspended);

        _state = MinerState.Activated;
    }

    function stopAndRemoveOwnership() public notTerminated onlySupervisor {
        require(_state != MinerState.Stopped);
        
        _state = MinerState.Stopped;
        _mining = false;
        _miner = address(0);
        _referral = address(0);
    }

    function resetMiner(address newOwnerAddress, address newReferralAddress) public notTerminated onlySupervisor {
        require(_state == MinerState.Stopped);

        _state = MinerState.Activated;
        _miner = newOwnerAddress;
        _referral = newReferralAddress;
    }

    function startMining() public notTerminated onlyMiner {
        require(_state == MinerState.Activated);
        require(!_mining);
        
        _mining = true;
    }

    function stopMining() public notTerminated onlyMiner {
        require(_state == MinerState.Activated);
        require(_mining);
        
        _mining = false;
    }

    function mine() public notTerminated onlySystem {
        require(_minerType == MinerType.PoolBased);
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

        uint256 minerTokens = _currentYearSupply / DAYS_PER_YEAR;
        uint256 referralTokens = minerTokens * 10 / 100;

        require(minerTokens > 0);
        require(referralTokens > 0);

        _token.safeTransfer(_miner, minerTokens);
        _token.safeTransfer(_referral, referralTokens);
    }

    function terminate() public onlyCoreTeam {
        _terminate();
    }

    function isAlgoMiner() public pure returns (bool) {
        return true;
    }

    function getMinerType() public view returns (uint8) {
        return uint8(_minerType);
    }

    function getCategory() public view returns (uint8) {
        return _category;
    }

    function getMiner() public view returns (address) {
        return _miner;
    }

    function getReferral() public view returns (address) {
        return _referral;
    }

    function isMining() public view returns (bool) {
        return _state == MinerState.Activated && _mining;
    }

    function getCurrentYear() public view returns (uint8) {
        return _currentYear;
    }

    function getCurrentDay() public view returns (uint16) {
        return _currentDay;
    }

    function getCurrentYearSupply() public view returns (uint256) {
        return _currentYearSupply;
    }
}
