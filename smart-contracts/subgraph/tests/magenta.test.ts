import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { DCAOrderCancelled } from "../generated/schema"
import { DCAOrderCancelled as DCAOrderCancelledEvent } from "../generated/Magenta/Magenta"
import { handleDCAOrderCancelled } from "../src/magenta"
import { createDCAOrderCancelledEvent } from "./magenta-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let identifier = Bytes.fromI32(1234567890)
    let newDCAOrderCancelledEvent = createDCAOrderCancelledEvent(identifier)
    handleDCAOrderCancelled(newDCAOrderCancelledEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DCAOrderCancelled created and stored", () => {
    assert.entityCount("DCAOrderCancelled", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DCAOrderCancelled",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "identifier",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
