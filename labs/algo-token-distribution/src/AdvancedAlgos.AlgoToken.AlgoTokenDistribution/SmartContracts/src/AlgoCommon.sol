pragma solidity 0.4.24;

contract AlgoCommon {

    uint256 internal constant TOKEN_FACTOR = 10 ** uint256(18);
    uint256 internal constant CAT_0_VALUE = 100000 * TOKEN_FACTOR;
    uint256 internal constant CAT_1_VALUE = 1000000 * TOKEN_FACTOR;
    uint256 internal constant CAT_2_VALUE = 2 * 1000000 * TOKEN_FACTOR;
    uint256 internal constant CAT_3_VALUE = 3 * 1000000 * TOKEN_FACTOR;
    uint256 internal constant CAT_4_VALUE = 4 * 1000000 * TOKEN_FACTOR;
    uint256 internal constant CAT_5_VALUE = 5 * 1000000 * TOKEN_FACTOR;

    function getCapacityByCategory(uint8 category) internal pure returns (uint256) {
        if(category == 0) {
            return CAT_0_VALUE;
        } else if(category == 1) {
            return CAT_1_VALUE;
        } else if(category == 2) {
            return CAT_2_VALUE;
        } else if(category == 3) {
            return CAT_3_VALUE;
        } else if(category == 4) {
            return CAT_4_VALUE;
        } else if(category == 5) {
            return CAT_5_VALUE;
        }
    }
}