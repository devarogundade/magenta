// SPDX-License-Identifier: MIT
pragma solidity <=0.8.24;

import {Data} from "../libraries/Data.sol";

interface ITimely {
    error IndexAlreadyExecuted(bytes32 identifier, uint64 index);
    error InsufficientFee();
    error InsufficientAmount(uint256 amount);
    error UnAuthorize();
    error IdentifierAlreadyCancelled();

    event Published(
        uint64 indexed nonce,
        bytes32 indexed identifier,
        address sender,
        uint64 delay,
        Data.Schedule iSchedule,
        Data.Minutes iMinutes,
        Data.Hours iHours,
        Data.Middleware middleware
    );
    event Deposited(address sender, uint256 amount);
    event Withdrawn(address sender, uint256 amount);
    event Cancelled(bytes32 identifier);
    event ClaimedTokens(address tokenId, uint256 amount);

    function publish(
        Data.TimePayload calldata timePayload
    ) external returns (bytes32);

    function cancel(bytes32 identifier) external;

    function deposit(uint256 amount) external;

    function withdraw(uint256 amount) external;

    function balanceOf(address sender) external view returns (uint256);

    function getTimelyToken() external view returns (address);

    function claimTokens(address tokenId, uint256 amount) external;

    function estimateFee(uint256 indexCount) external view returns (uint256);

    function isExecuted(
        bytes32 identifier,
        uint64 index
    ) external view returns (bool);
}
