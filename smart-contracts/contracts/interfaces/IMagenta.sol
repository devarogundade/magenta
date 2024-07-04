// SPDX-License-Identifier: MIT
pragma solidity <=0.8.24;

import {Data} from "../timely/libraries/Data.sol";

interface IMagenta {
    // === Enums ===
    enum OrderType {
        SwapOrder,
        LimitOrder,
        DCAOrder,
        TransferOrder
    }

    // === Structs ===
    struct SwapOrder {
        address actor;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOutMin;
        uint256 timestamp;
        uint256 deadline;
        bool completed;
    }

    struct LimitOrder {
        address actor;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 amountOutMin;
        uint256 timestamp;
        uint256 deadline;
        bool completed;
    }

    struct DCAOrder {
        address actor;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 numOfOrders;
        Data.Minutes iMinutes;
        Data.Hours iHours;
        uint256 amountInBalance;
        uint256 timestamp;
        bool completed;
    }

    struct TransferOrder {
        address actor;
        address receiver;
        address tokenIn;
        uint256 amountIn;
        uint256 numOfOrders;
        Data.Minutes iMinutes;
        Data.Hours iHours;
        uint256 amountInBalance;
        uint256 timestamp;
        bool completed;
    }

    // === Events ===
    event SwapOrderCreated(
        address indexed actor,
        bytes32 indexed identifier,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint64 startDelay,
        uint256 deadline
    );

    event SwapOrderCancelled(bytes32 indexed identifier);

    event SwapOrderExecuted(bytes32 indexed identifier);

    event LimitOrderCreated(
        address indexed actor,
        bytes32 indexed identifier,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint64 startDelay,
        uint256 deadline
    );

    event LimitOrdeCancelled(bytes32 indexed identifier);

    event LimitOrderExecuted(bytes32 indexed identifier);

    event DCAOrderCreated(
        address indexed actor,
        bytes32 indexed identifier,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint64 startDelay,
        uint256 numOfOrders,
        Data.Minutes iMinutes,
        Data.Hours iHours
    );

    event DCAOrderCancelled(bytes32 indexed identifier);

    event DCAOrderExecuted(bytes32 indexed identifier, uint256 amountInBalance);

    event TransferOrderCreated(
        address indexed actor,
        bytes32 indexed identifier,
        address receiver,
        address tokenIn,
        uint256 amountIn,
        uint64 startDelay,
        uint256 numOfOrders,
        Data.Minutes iMinutes,
        Data.Hours iHours
    );

    event TransferOrderCancelled(bytes32 indexed identifier);

    event TransferOrderExecuted(
        bytes32 indexed identifier,
        uint256 amountInBalance
    );

    // === Functions ===
    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint64 startDelay,
        uint256 deadline
    ) external payable returns (bytes32);

    function cancelSwapOrder(bytes32 identifier) external;

    function createLimitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint64 startDelay,
        uint256 deadline
    ) external payable returns (bytes32);

    function cancelLimitOrder(bytes32 identifier) external;

    function createDCAOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint64 startDelay,
        uint256 numOfOrders,
        Data.Minutes iMinutes,
        Data.Hours iHours
    ) external payable returns (bytes32);

    function cancelDCAOrder(bytes32 identifier) external;

    function createTransferOrder(
        address receiver,
        address tokenIn,
        uint256 amountIn,
        uint64 startDelay,
        uint256 numOfOrders,
        Data.Minutes iMinutes,
        Data.Hours iHours
    ) external payable returns (bytes32);

    function cancelTranferOrder(bytes32 identifier) external;

    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 fee
    ) external view returns (uint256);
}
