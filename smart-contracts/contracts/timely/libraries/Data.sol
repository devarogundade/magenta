// SPDX-License-Identifier: MIT
pragma solidity <=0.8.24;

library Data {
    enum Minutes {
        ONE_MINUTES,
        TWO_MINUTES,
        FIVE_MINUTES,
        TEN_MINUTES,
        FIFTEEN_MINUTES,
        TWENTY_MINUTES,
        TWENTY_FIVE_MINUTES,
        THIRTY_MINUTES,
        THIRTY_FIVE_MINUTES,
        FORTY_MINUTES,
        FORTY_FIVE_MINUTES,
        FIFTY_MINUTES,
        FIFTY_FIVE_MINUTES,
        SIXTY_MINUTES,
        INGORE
    }

    enum Hours {
        ZERO_HOUR,
        ONE_HOUR,
        TWO_HOUR,
        THREE_HOUR,
        FOUR_HOUR,
        FIVE_HOUR,
        SIX_HOUR,
        SEVEN_HOUR,
        EIGHT_HOUR,
        NINE_HOUR,
        TEN_HOUR,
        ELEVEN_HOUR,
        TWELVE_HOUR,
        THIRTEEN_HOUR,
        FOURTEEN_HOUR,
        FIFTEEN_HOUR,
        SIXTEEN_HOUR,
        SEVENTEEN_HOUR,
        EIGHTEEN_HOUR,
        NINETEEN_HOUR,
        TWENTY_HOUR,
        TWENTY_ONE_HOUR,
        TWENTY_TWO_HOUR,
        TWENTY_THREE_HOUR,
        INGORE
    }

    enum Schedule {
        ONCE,
        REPEAT
    }

    enum Middleware {
        EXISTS,
        INGORE
    }

    struct TimePayload {
        uint64 delay;
        Schedule iSchedule;
        Minutes iMinutes;
        Hours iHours;
        Middleware middleware;
    }

    struct TimePayloadIn {
        bytes32 identifier;
        uint64 index;
    }
}
