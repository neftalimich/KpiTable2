define([], function () {
    "use strict";
    return {
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [{
                qWidth: 20,
                qHeight: 50
            }]
        },
        cube2: {
            qHyperCubeDef: {
                qInitialDataFetch: [
                    {
                        qHeight: 2000,
                        qWidth: 5
                    }
                ],
                qDimensions: [],
                qMeasures: [],
                qSuppressZero: false,
                qSuppressMissing: false,
                qMode: "S",
                qColumnOrder: [],
                qInterColumnSortOrder: [],
                qStateName: "$"
            }
        }
    };
});