// SPDX-License-Identifier: MIT
pragma solidity <=0.8.24;

import {Data} from "./libraries/Data.sol";

import {ITimelyReceiver} from "./interfaces/ITimelyReceiver.sol";

import {Context} from "@openzeppelin/contracts/utils/Context.sol";

abstract contract TimelyReceiver is ITimelyReceiver, Context {
    address private immutable _timely;

    constructor(address timely_) {
        if (timely_ == address(0)) revert InvalidRouter(address(0));
        _timely = timely_;
    }

    function timelyCallback(
        Data.TimePayloadIn calldata timePayload
    ) external virtual override onlyTimely {
        _timelyCallback(timePayload);
    }

    function timelyMiddleware(
        bytes32 identifier
    ) external view virtual override returns (bool) {
        return _timelyMiddleware(identifier);
    }

    function _timelyCallback(
        Data.TimePayloadIn calldata timePayload
    ) internal virtual;

    function _timelyMiddleware(
        bytes32 identifier
    ) internal view virtual returns (bool);

    function getTimely() public view override returns (address) {
        return _timely;
    }

    error InvalidRouter(address router);

    modifier onlyTimely() {
        if (_timely != _msgSender()) revert InvalidRouter(_msgSender());
        _;
    }
}
