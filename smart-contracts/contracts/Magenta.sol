// SPDX-License-Identifier: MIT
pragma solidity <=0.8.24;

import {Data} from "./timely/libraries/Data.sol";
import {IMagenta} from "./interfaces/IMagenta.sol";
import {ITimely} from "./timely/interfaces/ITimely.sol";
import {TimelyReceiver} from "./timely/TimelyReceiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IUniswapV2Router01} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import {IUniswapV2Pair} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract Magenta is TimelyReceiver, AccessControl, Pausable, IMagenta {
    using SafeERC20 for IERC20;
    using Math for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    ITimely private _timely;
    IUniswapV2Router01 private _router;

    uint256 private _totalEarnedFees = 0;

    uint256 private _magentaFee;

    uint256 private _count;
    bytes32 private _identifier;

    // === Mappings ===
    mapping(bytes32 => SwapOrder) private _swapOrders;
    mapping(bytes32 => DCAOrder) private _dcaOrders;
    mapping(bytes32 => LimitOrder) private _limitOrders;
    mapping(bytes32 => TransferOrder) private _transferOrders;

    mapping(bytes32 => OrderType) private _orderTypes;

    constructor(
        address timely,
        address router,
        uint256 magentaFee
    ) TimelyReceiver(timely) {
        _timely = ITimely(getTimely());
        _router = IUniswapV2Router01(router);
        _magentaFee = magentaFee;

        _grantRole(ADMIN_ROLE, _msgSender());
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        IERC20(_timely.getTimelyToken()).approve(
            getTimely(),
            type(uint256).max
        );
    }

    // === Mutative Functions ===
    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint64 startDelay,
        uint256 deadline
    ) external payable override whenNotPaused returns (bytes32) {
        IERC20(tokenIn).safeTransferFrom(_msgSender(), address(this), amountIn);

        if (startDelay > 0) {
            require(msg.value >= _magentaFee, "Insufficient fee");
            _totalEarnedFees += _magentaFee;

            uint256 numberOfExecution = 1;
            uint256 timelyFee = _timely.estimateFee(numberOfExecution);

            IERC20(_timely.getTimelyToken()).safeTransferFrom(
                _msgSender(),
                address(this),
                timelyFee
            );

            _timely.deposit(timelyFee);

            // Create the time function param.
            Data.TimePayload memory timePayload = Data.TimePayload({
                delay: startDelay,
                iSchedule: Data.Schedule.ONCE,
                iMinutes: Data.Minutes.INGORE,
                iHours: Data.Hours.INGORE,
                middleware: Data.Middleware.INGORE
            });

            // Publish the time function to timely network.
            // And update the identifier.
            bytes32 identifier = _timely.publish(timePayload);

            _swapOrders[identifier] = SwapOrder({
                actor: _msgSender(),
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                amountIn: amountIn,
                amountOutMin: amountOutMin,
                timestamp: block.timestamp,
                deadline: deadline,
                completed: false
            });
            _orderTypes[identifier] = OrderType.SwapOrder;

            emit SwapOrderCreated(
                _msgSender(),
                identifier,
                tokenIn,
                tokenOut,
                amountIn,
                amountOutMin,
                startDelay,
                deadline
            );

            return identifier;
        }

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        IERC20(tokenIn).approve(address(_router), amountIn);

        _router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            _msgSender(),
            deadline
        );

        bytes32 nullIdentifier = bytes32(
            keccak256(
                abi.encode(
                    _msgSender(),
                    tokenIn,
                    tokenOut,
                    amountIn,
                    block.timestamp
                )
            )
        );

        emit SwapOrderCreated(
            _msgSender(),
            nullIdentifier,
            tokenIn,
            tokenOut,
            amountIn,
            amountOutMin,
            startDelay,
            deadline
        );

        emit SwapOrderExecuted(nullIdentifier);

        return nullIdentifier;
    }

    function cancelSwapOrder(bytes32 identifier) external whenNotPaused {
        SwapOrder storage order = _swapOrders[identifier];
        require(!order.completed, "Order was completed");
        require(order.actor == _msgSender());

        IERC20(order.tokenIn).safeTransfer(order.actor, order.amountIn);

        // mark as completed
        order.completed = true;

        _timely.cancel(identifier);

        emit SwapOrderCancelled(identifier);
    }

    function createLimitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        uint64 startDelay,
        uint256 deadline
    ) external payable override whenNotPaused returns (bytes32) {
        IERC20(tokenIn).safeTransferFrom(_msgSender(), address(this), amountIn);

        require(msg.value >= _magentaFee, "Insufficient fee");
        _totalEarnedFees += _magentaFee;

        uint256 numberOfExecution = 1;
        uint256 timelyFee = _timely.estimateFee(numberOfExecution);

        IERC20(_timely.getTimelyToken()).safeTransferFrom(
            _msgSender(),
            address(this),
            timelyFee
        );

        _timely.deposit(timelyFee);

        // Create the time function param.
        Data.TimePayload memory timePayload = Data.TimePayload({
            delay: startDelay,
            iSchedule: Data.Schedule.REPEAT,
            iMinutes: Data.Minutes.ONE_MINUTES,
            iHours: Data.Hours.INGORE,
            middleware: Data.Middleware.EXISTS
        });

        // Publish the time function to timely network.
        // And update the identifier.
        bytes32 identifier = _timely.publish(timePayload);

        _limitOrders[identifier] = LimitOrder({
            actor: _msgSender(),
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            amountOutMin: amountOutMin,
            timestamp: block.timestamp,
            deadline: deadline,
            completed: false
        });
        _orderTypes[identifier] = OrderType.DCAOrder;

        emit LimitOrderCreated(
            _msgSender(),
            identifier,
            tokenIn,
            tokenOut,
            amountIn,
            amountOutMin,
            startDelay,
            deadline
        );

        return identifier;
    }

    function cancelLimitOrder(
        bytes32 identifier
    ) external override whenNotPaused {
        LimitOrder storage order = _limitOrders[identifier];
        require(!order.completed, "Order was completed");
        require(order.actor == _msgSender());

        IERC20(order.tokenIn).safeTransfer(order.actor, order.amountIn);

        // mark as completed
        order.completed = true;

        _timely.cancel(identifier);

        emit LimitOrdeCancelled(identifier);
    }

    function createDCAOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint64 startDelay,
        uint256 numOfOrders,
        Data.Minutes iMinutes,
        Data.Hours iHours
    ) external payable override whenNotPaused returns (bytes32) {
        IERC20(tokenIn).safeTransferFrom(_msgSender(), address(this), amountIn);

        require(msg.value >= _magentaFee, "Insufficient fee");
        _totalEarnedFees += _magentaFee;

        uint256 numberOfExecution = numOfOrders;
        uint256 timelyFee = _timely.estimateFee(numberOfExecution);

        IERC20(_timely.getTimelyToken()).safeTransferFrom(
            _msgSender(),
            address(this),
            timelyFee
        );

        _timely.deposit(timelyFee);

        // Create the time function param.
        Data.TimePayload memory timePayload = Data.TimePayload({
            delay: startDelay,
            iSchedule: Data.Schedule.REPEAT,
            iMinutes: iMinutes,
            iHours: iHours,
            middleware: Data.Middleware.INGORE
        });

        // Publish the time function to timely network.
        // And update the identifier.
        bytes32 identifier = _timely.publish(timePayload);

        _dcaOrders[identifier] = DCAOrder({
            actor: _msgSender(),
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            numOfOrders: numOfOrders,
            iMinutes: iMinutes,
            iHours: iHours,
            amountInBalance: amountIn,
            timestamp: block.timestamp,
            completed: false
        });
        _orderTypes[identifier] = OrderType.DCAOrder;

        emit DCAOrderCreated(
            _msgSender(),
            identifier,
            tokenIn,
            tokenOut,
            amountIn,
            startDelay,
            numOfOrders,
            iMinutes,
            iHours
        );

        return identifier;
    }

    function cancelDCAOrder(
        bytes32 identifier
    ) external override whenNotPaused {
        DCAOrder storage order = _dcaOrders[identifier];
        require(!order.completed, "Order was completed");
        require(order.actor == _msgSender());

        IERC20(order.tokenIn).safeTransfer(order.actor, order.amountInBalance);

        // mark as completed
        order.completed = true;

        _timely.cancel(identifier);

        emit DCAOrderCancelled(identifier);
    }

    function createTransferOrder(
        address receiver,
        address tokenIn,
        uint256 amountIn,
        uint64 startDelay,
        uint256 numOfOrders,
        Data.Minutes iMinutes,
        Data.Hours iHours
    ) external payable override whenNotPaused returns (bytes32) {
        require(_msgSender() != receiver, "Can't do self transfer");

        IERC20(tokenIn).safeTransferFrom(_msgSender(), address(this), amountIn);

        uint256 numberOfExecution = numOfOrders;

        require(msg.value >= _magentaFee, "Insufficient fee");
        _totalEarnedFees += _magentaFee;

        uint256 timelyFee = _timely.estimateFee(numberOfExecution);

        IERC20(_timely.getTimelyToken()).safeTransferFrom(
            _msgSender(),
            address(this),
            timelyFee
        );

        _timely.deposit(timelyFee);

        // Create the time function param.
        Data.TimePayload memory timePayload = Data.TimePayload({
            delay: startDelay,
            iSchedule: Data.Schedule.REPEAT,
            iMinutes: iMinutes,
            iHours: iHours,
            middleware: Data.Middleware.INGORE
        });

        // Publish the time function to timely network.
        // And update the identifier.
        bytes32 identifier = _timely.publish(timePayload);

        _transferOrders[identifier] = TransferOrder({
            actor: _msgSender(),
            receiver: receiver,
            tokenIn: tokenIn,
            amountIn: amountIn,
            numOfOrders: numOfOrders,
            iMinutes: iMinutes,
            iHours: iHours,
            amountInBalance: amountIn,
            timestamp: block.timestamp,
            completed: false
        });
        _orderTypes[identifier] = OrderType.TransferOrder;

        emit TransferOrderCreated(
            _msgSender(),
            identifier,
            receiver,
            tokenIn,
            amountIn,
            startDelay,
            numOfOrders,
            iMinutes,
            iHours
        );

        return identifier;
    }

    function cancelTranferOrder(
        bytes32 identifier
    ) external override whenNotPaused {
        TransferOrder storage order = _transferOrders[identifier];
        require(!order.completed, "TransferOrder was completed");
        require(order.actor == _msgSender());

        IERC20(order.tokenIn).safeTransfer(order.actor, order.amountInBalance);

        // mark as completed
        order.completed = true;

        _timely.cancel(identifier);

        emit TransferOrderCancelled(identifier);
    }

    // === Internal Callback Functions ===
    function _timelyCallback(
        Data.TimePayloadIn calldata timePayload
    ) internal virtual override {
        bytes32 identifier = timePayload.identifier;
        OrderType orderType = _orderTypes[identifier];

        if (orderType == OrderType.SwapOrder) {
            _executeSwapOrderInternal(identifier);
        }

        if (orderType == OrderType.LimitOrder) {
            _executeLimitOrderInternal(identifier);
        }

        if (orderType == OrderType.DCAOrder) {
            _executeDCAOrderInternal(identifier);
        }

        if (orderType == OrderType.TransferOrder) {
            _executeTransferInternal(identifier);
        }

        // Check if deposited amount will be enough for next iteration.
        uint256 estimatedFee = _timely.estimateFee(1);

        if (_timely.balanceOf(address(this)) < estimatedFee) {
            // pay for next five iteration.
            _timely.deposit(estimatedFee * 5);
        }
    }

    function _timelyMiddleware(
        bytes32 identifier
    ) internal view virtual override returns (bool) {
        OrderType orderType = _orderTypes[identifier];

        if (orderType == OrderType.LimitOrder) {
            LimitOrder memory order = _limitOrders[identifier];

            uint256 amountOut = getAmountOut(
                order.tokenIn,
                order.tokenOut,
                order.amountIn,
                0
            );

            return amountOut >= order.amountOutMin;
        }

        return true;
    }

    // === Internal Functions ===
    function _executeSwapOrderInternal(bytes32 identifier) internal {
        SwapOrder storage order = _swapOrders[identifier];
        require(!order.completed, "Order has been completed");

        address[] memory path = new address[](2);
        path[0] = order.tokenIn;
        path[1] = order.tokenOut;

        IERC20(order.tokenIn).approve(address(_router), order.amountIn);

        _router.swapExactTokensForTokens(
            order.amountIn,
            order.amountOutMin,
            path,
            order.actor,
            order.deadline
        );

        // mark as completed
        order.completed = true;

        _timely.cancel(identifier);

        emit SwapOrderExecuted(identifier);
    }

    function _executeLimitOrderInternal(bytes32 identifier) internal {
        LimitOrder storage order = _limitOrders[identifier];
        require(!order.completed, "Order has been completed");

        address[] memory path = new address[](2);
        path[0] = order.tokenIn;
        path[1] = order.tokenOut;

        IERC20(order.tokenIn).approve(address(_router), order.amountIn);

        _router.swapExactTokensForTokens(
            order.amountIn,
            order.amountOutMin,
            path,
            order.actor,
            order.deadline
        );

        // mark as completed
        order.completed = true;

        _timely.cancel(identifier);

        emit LimitOrderExecuted(identifier);
    }

    function _executeDCAOrderInternal(bytes32 identifier) internal {
        DCAOrder storage order = _dcaOrders[identifier];
        require(!order.completed, "Order has been completed");

        uint256 amountPerSwap = order.amountIn / order.numOfOrders;

        address[] memory path = new address[](2);
        path[0] = order.tokenIn;
        path[1] = order.tokenOut;

        IERC20(order.tokenIn).approve(address(_router), amountPerSwap);

        _router.swapExactTokensForTokens(
            amountPerSwap,
            0, // amountOutMin
            path,
            order.actor,
            block.timestamp + 10 // deadline
        );

        order.amountInBalance -= amountPerSwap;

        // clean up before completing
        if (amountPerSwap > order.amountInBalance) {
            if (order.amountInBalance > 0) {
                IERC20(order.tokenIn).safeTransfer(
                    order.actor,
                    order.amountInBalance
                );

                order.amountInBalance = 0;
            }

            // mark as completed
            order.completed = true;

            _timely.cancel(identifier);
        }

        emit DCAOrderExecuted(identifier, order.amountInBalance);
    }

    function _executeTransferInternal(bytes32 identifier) internal {
        TransferOrder storage order = _transferOrders[identifier];
        require(!order.completed, "TransferOrder has been completed");

        uint256 amountPerTransfer = order.amountIn / order.numOfOrders;

        IERC20(order.tokenIn).safeTransfer(order.receiver, amountPerTransfer);

        order.amountInBalance -= amountPerTransfer;

        // clean up before completing
        if (amountPerTransfer > order.amountInBalance) {
            if (order.amountInBalance > 0) {
                IERC20(order.tokenIn).safeTransfer(
                    order.receiver,
                    order.amountInBalance
                );

                order.amountInBalance = 0;
            }

            // mark as completed
            order.completed = true;

            _timely.cancel(identifier);
        }

        emit TransferOrderExecuted(identifier, order.amountInBalance);
    }

    // === Public Functions ===
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 fee
    ) public view override returns (uint256) {
        address pair = IUniswapV2Factory(_router.factory()).getPair(
            tokenIn,
            tokenOut
        );

        (uint112 reserve0, uint112 reserve1, ) = IUniswapV2Pair(pair)
            .getReserves();

        address token0 = IUniswapV2Pair(pair).token0();

        (uint112 reserveIn, uint112 reserveOut) = tokenIn == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);

        uint256 amountOut = _getAmountOut(amountIn, reserveIn, reserveOut, fee);

        return amountOut;
    }

    // === Private Functions ===
    function _getAmountOut(
        uint256 amountIn,
        uint112 reserveIn,
        uint256 reserveOut,
        uint256 fee
    ) private pure returns (uint256) {
        uint256 usedFee = fee > 0 ? fee : 9_970;
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0); // INSUFFICIENT_INPUT_AMOUNT, INSUFFICIENT_LIQUIDITY
        uint256 amountInWithFee = amountIn * usedFee;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 10_000) + amountInWithFee;
        return numerator / denominator;
    }

    // === Admin Functions ===
    function depositFunds(uint256 amount) external onlyRole(ADMIN_ROLE) {
        _timely.deposit(amount);
    }

    function withdrawFees(
        address receiver,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        require(amount <= _totalEarnedFees, "Insufficient amount");

        payable(receiver).transfer(amount);

        _totalEarnedFees -= amount;
    }

    function updateMagentaFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        _magentaFee = newFee;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unPause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
