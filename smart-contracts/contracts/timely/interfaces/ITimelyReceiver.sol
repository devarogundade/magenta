// SPDX-License-Identifier: MIT
pragma solidity <=0.8.24;

import {Data} from "../libraries/Data.sol";

interface ITimelyReceiver {
    function timelyCallback(Data.TimePayloadIn calldata timePayload) external;

    function timelyMiddleware(bytes32 identifier) external view returns (bool);

    function getTimely() external view returns (address);
}
