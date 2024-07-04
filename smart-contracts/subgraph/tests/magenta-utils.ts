import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  DCAOrderCancelled,
  DCAOrderCreated,
  DCAOrderExecuted,
  LimitOrdeCancelled,
  LimitOrderCreated,
  LimitOrderExecuted,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SwapOrderCancelled,
  SwapOrderCreated,
  SwapOrderExecuted,
  TransferOrderCancelled,
  TransferOrderCreated,
  TransferOrderExecuted,
  Unpaused
} from "../generated/Magenta/Magenta"

export function createDCAOrderCancelledEvent(
  identifier: Bytes
): DCAOrderCancelled {
  let dcaOrderCancelledEvent = changetype<DCAOrderCancelled>(newMockEvent())

  dcaOrderCancelledEvent.parameters = new Array()

  dcaOrderCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )

  return dcaOrderCancelledEvent
}

export function createDCAOrderCreatedEvent(
  actor: Address,
  identifier: Bytes,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: BigInt,
  startDelay: BigInt,
  numOfOrders: BigInt,
  iMinutes: i32,
  iHours: i32
): DCAOrderCreated {
  let dcaOrderCreatedEvent = changetype<DCAOrderCreated>(newMockEvent())

  dcaOrderCreatedEvent.parameters = new Array()

  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("actor", ethereum.Value.fromAddress(actor))
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startDelay",
      ethereum.Value.fromUnsignedBigInt(startDelay)
    )
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "numOfOrders",
      ethereum.Value.fromUnsignedBigInt(numOfOrders)
    )
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "iMinutes",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(iMinutes))
    )
  )
  dcaOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "iHours",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(iHours))
    )
  )

  return dcaOrderCreatedEvent
}

export function createDCAOrderExecutedEvent(
  identifier: Bytes,
  amountInBalance: BigInt
): DCAOrderExecuted {
  let dcaOrderExecutedEvent = changetype<DCAOrderExecuted>(newMockEvent())

  dcaOrderExecutedEvent.parameters = new Array()

  dcaOrderExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )
  dcaOrderExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "amountInBalance",
      ethereum.Value.fromUnsignedBigInt(amountInBalance)
    )
  )

  return dcaOrderExecutedEvent
}

export function createLimitOrdeCancelledEvent(
  identifier: Bytes
): LimitOrdeCancelled {
  let limitOrdeCancelledEvent = changetype<LimitOrdeCancelled>(newMockEvent())

  limitOrdeCancelledEvent.parameters = new Array()

  limitOrdeCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )

  return limitOrdeCancelledEvent
}

export function createLimitOrderCreatedEvent(
  actor: Address,
  identifier: Bytes,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: BigInt,
  amountOutMin: BigInt,
  startDelay: BigInt,
  deadline: BigInt
): LimitOrderCreated {
  let limitOrderCreatedEvent = changetype<LimitOrderCreated>(newMockEvent())

  limitOrderCreatedEvent.parameters = new Array()

  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("actor", ethereum.Value.fromAddress(actor))
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountOutMin",
      ethereum.Value.fromUnsignedBigInt(amountOutMin)
    )
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startDelay",
      ethereum.Value.fromUnsignedBigInt(startDelay)
    )
  )
  limitOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )

  return limitOrderCreatedEvent
}

export function createLimitOrderExecutedEvent(
  identifier: Bytes
): LimitOrderExecuted {
  let limitOrderExecutedEvent = changetype<LimitOrderExecuted>(newMockEvent())

  limitOrderExecutedEvent.parameters = new Array()

  limitOrderExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )

  return limitOrderExecutedEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createSwapOrderCancelledEvent(
  identifier: Bytes
): SwapOrderCancelled {
  let swapOrderCancelledEvent = changetype<SwapOrderCancelled>(newMockEvent())

  swapOrderCancelledEvent.parameters = new Array()

  swapOrderCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )

  return swapOrderCancelledEvent
}

export function createSwapOrderCreatedEvent(
  actor: Address,
  identifier: Bytes,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: BigInt,
  amountOutMin: BigInt,
  startDelay: BigInt,
  deadline: BigInt
): SwapOrderCreated {
  let swapOrderCreatedEvent = changetype<SwapOrderCreated>(newMockEvent())

  swapOrderCreatedEvent.parameters = new Array()

  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("actor", ethereum.Value.fromAddress(actor))
  )
  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )
  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  )
  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountOutMin",
      ethereum.Value.fromUnsignedBigInt(amountOutMin)
    )
  )
  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startDelay",
      ethereum.Value.fromUnsignedBigInt(startDelay)
    )
  )
  swapOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "deadline",
      ethereum.Value.fromUnsignedBigInt(deadline)
    )
  )

  return swapOrderCreatedEvent
}

export function createSwapOrderExecutedEvent(
  identifier: Bytes
): SwapOrderExecuted {
  let swapOrderExecutedEvent = changetype<SwapOrderExecuted>(newMockEvent())

  swapOrderExecutedEvent.parameters = new Array()

  swapOrderExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )

  return swapOrderExecutedEvent
}

export function createTransferOrderCancelledEvent(
  identifier: Bytes
): TransferOrderCancelled {
  let transferOrderCancelledEvent = changetype<TransferOrderCancelled>(
    newMockEvent()
  )

  transferOrderCancelledEvent.parameters = new Array()

  transferOrderCancelledEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )

  return transferOrderCancelledEvent
}

export function createTransferOrderCreatedEvent(
  actor: Address,
  identifier: Bytes,
  receiver: Address,
  tokenIn: Address,
  amountIn: BigInt,
  startDelay: BigInt,
  numOfOrders: BigInt,
  iMinutes: i32,
  iHours: i32
): TransferOrderCreated {
  let transferOrderCreatedEvent = changetype<TransferOrderCreated>(
    newMockEvent()
  )

  transferOrderCreatedEvent.parameters = new Array()

  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("actor", ethereum.Value.fromAddress(actor))
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver))
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(amountIn)
    )
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startDelay",
      ethereum.Value.fromUnsignedBigInt(startDelay)
    )
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "numOfOrders",
      ethereum.Value.fromUnsignedBigInt(numOfOrders)
    )
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "iMinutes",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(iMinutes))
    )
  )
  transferOrderCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "iHours",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(iHours))
    )
  )

  return transferOrderCreatedEvent
}

export function createTransferOrderExecutedEvent(
  identifier: Bytes,
  amountInBalance: BigInt
): TransferOrderExecuted {
  let transferOrderExecutedEvent = changetype<TransferOrderExecuted>(
    newMockEvent()
  )

  transferOrderExecutedEvent.parameters = new Array()

  transferOrderExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "identifier",
      ethereum.Value.fromFixedBytes(identifier)
    )
  )
  transferOrderExecutedEvent.parameters.push(
    new ethereum.EventParam(
      "amountInBalance",
      ethereum.Value.fromUnsignedBigInt(amountInBalance)
    )
  )

  return transferOrderExecutedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
