define([
    "qlik",
    'ng!$q'
], function (qlik, $q) {
    "use strict";

    var app = qlik.currApp();
    var getSheetList = function () {
        var defer = $q.defer();
        app.getAppObjectList(function (data) {
            var sheets = [];
            var sortedData = _.sortBy(data.qAppObjectList.qItems, function (item) {
                return item.qData.rank;
            });
            _.each(sortedData, function (item) {
                sheets.push({
                    value: item.qInfo.qId,
                    label: item.qMeta.title
                });
            });
            return defer.resolve(sheets);
        });

        return defer.promise;
    };

    return {
        type: "items",
        component: "accordion",
        items: {
            dimensions: {
                uses: "dimensions",
                min: 6,
                items: {
                    textAlign: {
                        type: "string",
                        component: "dropdown",
                        label: "Text Align",
                        ref: "qDef.pTextAlign",
                        options: [
                            {
                                value: "text-left",
                                label: "Izquierda"
                            },
                            {
                                value: "text-center",
                                label: "Centro"
                            }, {
                                value: "text-right",
                                label: "Derecha"
                            }
                        ],
                        defaultValue: "text-left"
                    },
                    textClass: {
                        type: "string",
                        label: "Text Class",
                        ref: "qDef.pTextClass",
                        defaultValue: ""
                    },
                    subtitle: {
                        type: "boolean",
                        ref: "qDef.pSubtitle",
                        label: "Subtitle",
                        defaultValue: false
                    },
                    type: {
                        type: "string",
                        component: "radiobuttons",
                        label: "Type of Value",
                        ref: "qDef.pType",
                        options: [{
                            value: 0,
                            label: "Normal"
                        }, {
                            value: 1,
                            label: "HTML"
                        }, {
                            value: 2,
                            label: "Icon"
                        }],
                        defaultValue: 0
                    },
                    iconClass: {
                        type: "string",
                        ref: "qDef.pIconClass",
                        label: "Add Icon (class name)",
                        defaultValue: ""
                    },
                    columnSize: {
                        type: "string",
                        ref: "qDef.pColumnSize",
                        label: "Column Size",
                        defaultValue: ""
                    },
                    fontSize: {
                        type: "string",
                        ref: "qDef.pFontSize",
                        label: "Column text size",
                        defaultValue: ""
                    }
                }
            },
            measures: {
                uses: "measures",
                min: 1,
                items: {
                    textAlign: {
                        type: "string",
                        component: "dropdown",
                        label: "Text Align",
                        ref: "qDef.pTextAlign",
                        options: [
                            {
                                value: "text-left",
                                label: "Izquierda"
                            },
                            {
                                value: "text-center",
                                label: "Centro"
                            }, {
                                value: "text-right",
                                label: "Derecha"
                            }
                        ],
                        defaultValue: "text-center"
                    },
                    expressionClass: {
                        type: "string",
                        component: "expression",
                        ref: "qAttributeExpressions.0.qExpression",
                        label: "Expression Class by Row",
                        expression: "optional",
                        defaultValue: ""
                    },
                    expressionTitle: {
                        type: "string",
                        component: "expression",
                        ref: "qAttributeExpressions.1.qExpression",
                        label: "Expression Title",
                        expression: "optional",
                        defaultValue: ""
                    },
                    colspanTitle: {
                        type: "number",
                        ref: "qDef.pColspanTitle",
                        label: "Colspan Title",
                        expression: "optional",
                        defaultValue: 1
                    },
                    textClass: {
                        type: "string",
                        label: "Text Class",
                        ref: "qDef.pTextClass",
                        defaultValue: ""
                    },
                    type: {
                        type: "string",
                        component: "radiobuttons",
                        label: "Type of Value",
                        ref: "qDef.pType",
                        options: [{
                            value: 0,
                            label: "Normal"
                        }, {
                            value: 1,
                            label: "HTML"
                        }, {
                            value: 2,
                            label: "Icon"
                        }],
                        defaultValue: 0
                    },
                    iconClass: {
                        type: "string",
                        ref: "qDef.pIconClass",
                        label: "Add Icon (class name)",
                        defaultValue: ""
                    },
                    columnSize: {
                        type: "string",
                        ref: "qDef.pColumnSize",
                        label: "Column Size",
                        defaultValue: ""
                    },
                    fontSize: {
                        type: "string",
                        ref: "qDef.pFontSize",
                        label: "Column text size",
                        defaultValue: ""
                    }
                }
            },
            sorting: {
                uses: "sorting"
            },
            cube2props: {
                label: "Cube 2",
                type: "items",
                items: {
                    Dimensions: {
                        type: "array",
                        ref: "cube2Dimensions",
                        label: "List of Dimensions",
                        itemTitleRef: "label",
                        allowAdd: true,
                        allowRemove: true,
                        addTranslation: "Add Dimension",
                        items: {
                            dimension: {
                                type: "string",
                                ref: "dimension",
                                label: "Dimension Expression",
                                expression: "always",
                                expressionType: "dimension"
                            },
                            label: {
                                type: "string",
                                ref: "label",
                                label: "Label",
                                expression: "optional"
                            }
                        }
                    },
                    Measures: {
                        type: "array",
                        ref: "cube2Measures",
                        label: "List of Measures",
                        itemTitleRef: "label",
                        allowAdd: true,
                        allowRemove: true,
                        addTranslation: "Add Measure",
                        items: {
                            measure: {
                                type: "string",
                                ref: "measure",
                                label: "Measure Expression",
                                expression: "always",
                                expressionType: "measure"
                            },
                            label: {
                                type: "string",
                                ref: "label",
                                label: "Label",
                                expression: "optional"
                            },
                            color: {
                                type: "string",
                                component: "expression",
                                ref: "qDef.pColor",
                                label: "Color",
                                expression: "optional",
                                defaultValue: ""
                            },
                            ledColor: {
                                type: "string",
                                component: "expression",
                                ref: "qAttributeExpressions.0.qExpression",
                                label: "Led Color",
                                expression: "optional",
                                defaultValue: ""
                            },
                            ledBorderColor: {
                                type: "string",
                                component: "expression",
                                ref: "qAttributeExpressions.1.qExpression",
                                label: "Led Border Color",
                                expression: "optional",
                                defaultValue: ""
                            }
                        }
                    }
                }
            },
            settings: {
                uses: "settings",
                items: {
                    initFetch: {
                        type: "items",
                        label: "Intial Fetch",
                        items: {
                            initFetchCols: {
                                ref: "qHyperCubeDef.qInitialDataFetch.0.qWidth",
                                label: "Cube 1 - Initial fetch cols",
                                type: "number",
                                defaultValue: 15
                            },
                            initFetchRows: {
                                ref: "qHyperCubeDef.qInitialDataFetch.0.qHeight",
                                label: "Cube 1 - Initial fetch rows",
                                type: "number",
                                defaultValue: 50
                            },
                            initFetchCols2: {
                                ref: "cube2.qHyperCubeDef.qInitialDataFetch.0.qWidth",
                                label: "Cube 2 - Initial fetch cols",
                                type: "number",
                                defaultValue: 5
                            },
                            initFetchRows2: {
                                ref: "cube2.qHyperCubeDef.qInitialDataFetch.0.qHeight",
                                label: "Cube 2 -Initial fetch rows",
                                type: "number",
                                defaultValue: 2000
                            }
                        }
                    },
                    General: {
                        type: "items",
                        label: "Table Configuration",
                        items: {
                            showGroups: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showGroups",
                                label: "Show Categories",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: true
                            },
                            showGroupIndex: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showGroupIndex",
                                label: "Show Group Index",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: false
                            },
                            showRowIndex: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showRowIndex",
                                label: "Show Row Index",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: true
                            },
                            showHelpIcon: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showHelpIcon",
                                label: "Show Help Icon",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: false
                            },
                            showTotals: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showTotals",
                                label: "Show Totals",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: false,
                            },
                            labelTotals: {
                                type: "string",
                                ref: "props.labelTotals",
                                label: "Label Totals",
                                defaultValue: "Totals"
                            },
                            columnOrder: {
                                type: "string",
                                ref: "props.columnOrder",
                                label: "Column Order",
                                defaultValue: "0,1,2,3,4,5"
                            },
                            selectedSheet: {
                                type: "string",
                                component: "dropdown",
                                label: "Select Sheet",
                                ref: "props.selectedSheet",
                                options: function () {
                                    return getSheetList().then(function (items) {
                                        return items;
                                    });
                                }
                            },
                            chartfield: {
                                type: "string",
                                ref: "props.chartfield",
                                label: "Chart Field",
                                expression: "optional"
                            },
                            tableHeaderFontSize: {
                                type: "string",
                                ref: "props.headerFontSize",
                                label: "Header TextSize",
                                defaultValue: "1vw"
                            },
                            tableBodyTextSize: {
                                type: "string",
                                ref: "props.bodyFontSize",
                                label: "Body TextSize",
                                defaultValue: "1vw"
                            },
                            snapshotEnabled: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.snapshotEnabled",
                                label: "Snapshot Enabled",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: true
                            }
                        }
                    },
                    Chart: {
                        type: "items",
                        label: "Chart Configuration",
                        items: {
                            showChart: {
                                type: "boolean",
                                component: "switch",
                                ref: "props.showChart",
                                label: "Show Chart",
                                options: [{
                                    value: true,
                                    label: "Yes"
                                }, {
                                    value: false,
                                    label: "No"
                                }],
                                defaultValue: true
                            },
                            chartHeight: {
                                type: "number",
                                ref: "props.chartHeight",
                                label: "Chart Height",
                                defaultValue: 60
                            },
                            chartWidth: {
                                type: "number",
                                ref: "props.chartWidth",
                                label: "Chart Width",
                                defaultValue: 150
                            },
                            chartLineColor: {
                                type: "string",
                                ref: "props.chartLineColor",
                                label: "Chart Line Color",
                                defaultValue: "#3e95cd"
                            },
                            chartLineWidth: {
                                type: "number",
                                ref: "props.chartLineWidth",
                                label: "Chart Line Border Width",
                                defaultValue: 1
                            },
                            chartPointRadius: {
                                type: "number",
                                ref: "props.chartPointRadius",
                                label: "Chart Point Radius",
                                defaultValue: 3
                            },
                            chartPointHoverRadius: {
                                type: "number",
                                ref: "props.chartPointHoverRadius",
                                label: "Chart Point Hover Radius",
                                defaultValue: 5
                            }
                        }
                    }
                }
            }
        }
    };
});