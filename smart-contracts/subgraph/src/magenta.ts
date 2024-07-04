import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  DCAOrderCancelled as DCAOrderCancelledEvent,
  DCAOrderCreated as DCAOrderCreatedEvent,
  DCAOrderExecuted as DCAOrderExecutedEvent,
  LimitOrdeCancelled as LimitOrdeCancelledEvent,
  LimitOrderCreated as LimitOrderCreatedEvent,
  LimitOrderExecuted as LimitOrderExecutedEvent,
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  SwapOrderCancelled as SwapOrderCancelledEvent,
  SwapOrderCreated as SwapOrderCreatedEvent,
  SwapOrderExecuted as SwapOrderExecutedEvent,
  TransferOrderCancelled as TransferOrderCancelledEvent,
  TransferOrderCreated as TransferOrderCreatedEvent,
  TransferOrderExecuted as TransferOrderExecutedEvent,
  Unpaused as UnpausedEvent
} from "../generated/Magenta/Magenta";
import {
  DCAOrderCreated,
  LimitOrderCreated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SwapOrderCreated,
  TransferOrderCreated,
  Unpaused
} from "../generated/schema";

export function handleDCAOrderCancelled(event: DCAOrderCancelledEvent): void {
  let entity = DCAOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.cancelled = true;

  entity.save();
}

export function handleDCAOrderCreated(event: DCAOrderCreatedEvent): void {
  let entity = new DCAOrderCreated(
    event.params.identifier
  );
  entity.actor = event.params.actor;
  entity.identifier = event.params.identifier;
  entity.tokenIn = event.params.tokenIn;
  entity.tokenOut = event.params.tokenOut;
  entity.amountIn = event.params.amountIn;
  entity.startDelay = event.params.startDelay;
  entity.numOfOrders = event.params.numOfOrders;
  entity.amountInBalance = new BigInt(0);
  entity.cancelled = false;
  entity.executed = false;
  entity.iMinutes = event.params.iMinutes;
  entity.iHours = event.params.iHours;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleDCAOrderExecuted(event: DCAOrderExecutedEvent): void {
  let entity = DCAOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.amountInBalance = event.params.amountInBalance;
  entity.executed = event.params.amountInBalance == new BigInt(0);

  entity.save();
}

export function handleLimitOrdeCancelled(event: LimitOrdeCancelledEvent): void {
  let entity = LimitOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.cancelled = true;

  entity.save();
}

export function handleLimitOrderCreated(event: LimitOrderCreatedEvent): void {
  let entity = new LimitOrderCreated(
    event.params.identifier
  );
  entity.actor = event.params.actor;
  entity.identifier = event.params.identifier;
  entity.tokenIn = event.params.tokenIn;
  entity.tokenOut = event.params.tokenOut;
  entity.amountIn = event.params.amountIn;
  entity.amountOutMin = event.params.amountOutMin;
  entity.cancelled = false;
  entity.executed = false;
  entity.startDelay = event.params.startDelay;
  entity.deadline = event.params.deadline;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleLimitOrderExecuted(event: LimitOrderExecutedEvent): void {
  let entity = LimitOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.executed = true;

  entity.save();
}

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.role = event.params.role;
  entity.previousAdminRole = event.params.previousAdminRole;
  entity.newAdminRole = event.params.newAdminRole;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleSwapOrderCancelled(event: SwapOrderCancelledEvent): void {
  let entity = SwapOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.cancelled = true;

  entity.save();
}

export function handleSwapOrderCreated(event: SwapOrderCreatedEvent): void {
  let entity = new SwapOrderCreated(
    event.params.identifier
  );
  entity.actor = event.params.actor;
  entity.identifier = event.params.identifier;
  entity.tokenIn = event.params.tokenIn;
  entity.tokenOut = event.params.tokenOut;
  entity.amountIn = event.params.amountIn;
  entity.amountOutMin = event.params.amountOutMin;
  entity.cancelled = false;
  entity.executed = false;
  entity.startDelay = event.params.startDelay;
  entity.deadline = event.params.deadline;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleSwapOrderExecuted(event: SwapOrderExecutedEvent): void {
  let entity = SwapOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.executed = true;

  entity.save();
}

export function handleTransferOrderCancelled(
  event: TransferOrderCancelledEvent
): void {
  let entity = TransferOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.cancelled = true;

  entity.save();
}

export function handleTransferOrderCreated(
  event: TransferOrderCreatedEvent
): void {
  let entity = new TransferOrderCreated(
    event.params.identifier
  );
  entity.actor = event.params.actor;
  entity.identifier = event.params.identifier;
  entity.receiver = event.params.receiver;
  entity.tokenIn = event.params.tokenIn;
  entity.amountIn = event.params.amountIn;
  entity.startDelay = event.params.startDelay;
  entity.numOfOrders = event.params.numOfOrders;
  entity.iMinutes = event.params.iMinutes;
  entity.iHours = event.params.iHours;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleTransferOrderExecuted(
  event: TransferOrderExecutedEvent
): void {
  let entity = TransferOrderCreated.load(
    event.params.identifier
  );

  if (!entity) return;

  entity.executed = true;

  entity.save();
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.account = event.params.account;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
