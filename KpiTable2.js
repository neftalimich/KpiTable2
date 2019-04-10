define([
    "qlik",
    "jquery",
    "./initial-properties",
    "./properties",
    "text!./style.css",
    "text!./template.html",
    "./js/highcharts"
], function (qlik, $, initProps, props, cssContent, template, highcharts) {
    'use strict';
    $("<style>").html(cssContent).appendTo("head");
    $('<link rel="stylesheet" type="text/css" href="/extensions/KpiTable2/css/font-awesome.css">').html("").appendTo("head");
    var app = qlik.currApp();

    return {
        template: template,
        initialProperties: initProps,
        definition: props,
        support: {
            snapshot: function (layout) {
                return layout.props.snapshotEnabled;
            },
            export: true,
            exportData: true
        },
        paint: function () {
            //setup scope.table
            if (!this.$scope.table) {
                this.$scope.table = qlik.table(this);
                // console.log("KpiTable2 - Table", this.$scope.table);
            }
            return qlik.Promise.resolve();
        },
        controller: ['$scope', '$timeout', function ($scope, $timeout) {
            //console.log("KpiTable2 - layout", $scope.layout);
            $scope.kpiTableId = $scope.layout.qInfo.qId;
            $scope.dimLength = 0;
            $scope.meaLength = 0;

            // ------------------------------- Watchers
            $scope.$watchCollection("layout.qHyperCube.qDataPages", function (newValue) {
                $scope.SetTableIndex();
                angular.element(document).ready(function () {
                    $scope.GroupData();
                    $scope.SetColumnOrder();
                    $timeout(function () {
                        $scope.LoadCharts("");
                    }, 1000);
                });
            });

            $scope.$watchCollection("layout.qHyperCube.qDimensionInfo", function (newValue) {
                $scope.dimLength = $scope.layout.qHyperCube.qDimensionInfo.length;
            });
            $scope.$watchCollection("layout.qHyperCube.qMeasureInfo", function (newValue) {
                $scope.meaLength = $scope.layout.qHyperCube.qMeasureInfo.length;
            });
            $scope.$watchCollection("layout.props.showGroups", function (newValue) {
                angular.element(document).ready(function () {
                    $scope.GroupData();
                });
            });
            $scope.$watchCollection("layout.props.columnOrder", function (newValue) {
                angular.element(document).ready(function () {
                    $scope.SetColumnOrder();
                });
            });
            // -------------------------------

            // ------------------------------- qAttrExps
            // 0. Class by each row - qAttributeExpressions.0.qExpression
            // 1. qAttributeExpressions.1.qExpression
            // Etc.
            $scope.tableIndex = [];
            $scope.SetTableIndex = function () {
                $scope.tableIndex = [];
                angular.forEach($scope.layout.qHyperCube.qDataPages, function (qDataPage, key) {
                    let pageKey = key;
                    angular.forEach(qDataPage.qMatrix, function (row, key) {
                        $scope.tableIndex.push({
                            page: pageKey,
                            index: key
                        });
                    });
                });
                //console.log("tableIndex", $scope.tableIndex);
            };
            // ------------------------------- More Data
            $scope.loading = false;
            $scope.GetMoreData = function (table) {
                if (table.rowCount > table.rows.length) {
                    $scope.loading = true;
                    table.getMoreData()
                        .then(val => {
                        })
                        .catch(err => {
                            // console.error("Tabla");
                            $scope.table = null;
                        })
                        .finally(f => {
                            $scope.loading = false;
                            $scope.GroupData();
                            $scope.NextPageCube2();
                        });
                }
                //console.log("table",table);
                return true;
            };
            // -------------------------------

            // ------------------------------- GroupData
            $scope.cubeGrouped = [];
            $scope.GroupData = function () {
                $scope.cubeGrouped = [];
                let qMatrixCopy = [];
                angular.forEach($scope.layout.qHyperCube.qDataPages, function (qDataPage, key) {
                    qMatrixCopy.push.apply(qMatrixCopy, JSON.parse(JSON.stringify(qDataPage.qMatrix)));
                });

                if ($scope.layout.props.showGroups) {
                    let categories = qMatrixCopy.reduce(function (obj, item, index) {
                        obj[item[1].qText] = obj[item[1].qText] || [];
                        obj[item[1].qText].push({ index: index, item: item });
                        return obj;
                    }, {});
                    $scope.cubeGrouped = Object.keys(categories).map(function (key) {
                        return { name: key, countItems: categories[key].length, data: categories[key] };
                    });

                    angular.forEach($scope.cubeGrouped, function (group, key) {
                        let level1Aux = group.data.reduce(function (obj, item, index) {
                            obj[item.item[2].qText] = obj[item.item[2].qText] || [];
                            obj[item.item[2].qText].push({ index: item.index, item: item.item });
                            return obj;
                        }, {});
                        let level1 = Object.keys(level1Aux).map(function (key) {
                            return { name: key, description:'', dataL1: level1Aux[key] };
                        });
                        group.data = level1;
                        angular.forEach(group.data, function (level1, key) {
                            let keeptGoing = true;
                            angular.forEach(level1.dataL1, function (level2, index) {
                                if (keeptGoing && level2.item[5].qText === "1") {
                                    level1.parentL1 = level2;
                                    level1.description = level2.item[3].qText;
                                    level1.dataL1.splice(index, 1);
                                    group.countItems -= 1;
                                    keeptGoing = false;
                                }
                            });
                            if (!level1.parentL1) {
                                level1.parentL1 = {
                                    index: 0, item: [{ qText: 0 }]
                                };
                            }
                        });
                    });
                } else {
                    $scope.cubeGrouped.push({ category: "", data: [], idxAux: [] });
                    for (let i = 0; i < qMatrixCopy.length; i++) {
                        $scope.cubeGrouped[0].countItems = qMatrixCopy.length;
                        $scope.cubeGrouped[0].data.push({ index: i, item: qMatrixCopy[i] });
                    }

                    angular.forEach($scope.cubeGrouped, function (group, key) {
                        let level1Aux = group.data.reduce(function (obj, item, index) {
                            obj[item.item[1].qText + ' - ' + item.item[2].qText] = obj[item.item[1].qText + ' - ' + item.item[2].qText] || [];
                            obj[item.item[1].qText + ' - ' + item.item[2].qText].push({ index: item.index, item: item.item });
                            return obj;
                        }, {});
                        let level1 = Object.keys(level1Aux).map(function (key) {
                            return { name: key, dataL1: level1Aux[key] };
                        });
                        //console.log(level1);
                        group.data = level1;
                        angular.forEach(group.data, function (level1, key) {
                            //console.log(key, level1);
                            let keeptGoing = true;
                            angular.forEach(level1.dataL1, function (level2, index) {
                                //console.log(key, level2, level2.item[3].qText);
                                if (keeptGoing && level2.item[5].qText === "1") {
                                    level1.parentL1 = level2;
                                    level1.description = level2.item[3].qText;
                                    level1.dataL1.splice(index, 1);
                                    keeptGoing = false;
                                }
                            });
                            if (!level1.parentL1) {
                                level1.parentL1 = {};
                            }
                        });
                    });
                }

                let countAux = 0;
                angular.forEach($scope.cubeGrouped, function (group, key) {
                    angular.forEach(group.data, function (level1, key) {
                        level1.index = countAux;
                        countAux += 1;
                    });
                });

                //console.log("cubeGrouped", $scope.cubeGrouped);
                $scope.LoadCharts("cube1Grouped");
            };

            $scope.CollapseChilds = function (level1, group) {
                level1.hide = !level1.hide;
                if (level1.hide) {
                    group.countItems -= level1.dataL1.length;
                } else {
                    group.countItems += level1.dataL1.length;
                }
            };
            // -------------------------------

            // ------------------------------- ColumnOrder
            $scope.columnOrder = [];
            $scope.SetColumnOrder = function () {
                let dimLength = $scope.layout.qHyperCube.qDimensionInfo.length;
                let meaLength = $scope.layout.qHyperCube.qMeasureInfo.length;
                $scope.columnOrder = [];
                if ($scope.layout.props.columnOrder) {
                    try {
                        let splitString = $scope.layout.props.columnOrder.split(',');
                        for (let i = 0; i < splitString.length; i++) {
                            if (!isNaN(splitString[i])) {
                                if (parseInt(splitString[i]) < dimLength + meaLength) {
                                    $scope.columnOrder.push(parseInt(splitString[i]));
                                }
                            }
                        }
                        if (splitString.length != dimLength + meaLength) {
                            for (let i = 0; i < dimLength + meaLength; i++) {
                                let exist = false;
                                for (let j = 0; j < splitString.length; j++) {
                                    if (parseInt(splitString[j]) == i) {
                                        exist = true;
                                        break;
                                    }
                                }
                                if (!exist) {
                                    $scope.columnOrder.push(i);
                                }
                            }
                        }
                    } catch (err) {
                        //console.log(err);
                    }
                } else {
                    for (let i = 0; i < dimLength + meaLength; i++) {
                        $scope.columnOrder.push(i);
                    }
                }
            };

            // -------------------------------

            // ------------------------------- CUBE 2
            var qDimensionTemplate = {
                qDef: {
                    qGrouping: "N",
                    qFieldDefs: "CHANGE_ME",
                    qFieldLabels: [""],
                    autoSort: false,
                    qSortCriterias: [
                        {
                            qSortByAscii: 0
                        }
                    ]
                },
                qNullSuppression: true
            };
            var qMeasureTemplate = {
                qDef: {
                    qLabel: "",
                    qDescription: "",
                    qTags: [""],
                    qGrouping: "N",
                    qDef: "CHANGE_ME",
                    qNumFormat: {
                        qDec: ".",
                        qFmt: "#,##0.00",
                        qThou: ",",
                        qType: "F",
                        qUseThou: 0,
                        qnDec: 2
                    },
                    autoSort: false
                },
                qAttributeExpressions: [],
                qSortBy: {
                    qSortByState: 0,
                    qSortByFrequency: 0,
                    qSortByNumeric: 0,
                    qSortByAscii: 0,
                    qSortByLoadOrder: 0,
                    qSortByExpression: 0,
                    qExpression: {
                        qv: ""
                    }
                }
            };

            // ------------------------------- Watchers 2
            $scope.$watchCollection("layout.cube2Dimensions", function (newVal) {
                let qDimensions = [];
                angular.forEach(newVal, function (value, key) {
                    if (value.dimension != "") {
                        let qDimAux = JSON.parse(JSON.stringify(qDimensionTemplate));
                        qDimAux.qDef.qLabel = [value.label];
                        qDimAux.qDef.qFieldDefs = [value.dimension];
                        qDimensions.push(qDimAux);
                    }
                });

                // $scope.backendApi.applyPatches([
                //     {
                //         "qPath": "/cube2/qHyperCubeDef/qDimensions",
                //         "qOp": "replace",
                //         "qValue": JSON.stringify(qDimensions)
                //     }
                // ], false);
            });
            $scope.$watchCollection("layout.cube2Measures", function (newVal) {
                let qMeasures = [];
                angular.forEach(newVal, function (value, key) {
                    if (value.measure != "") {
                        let qMeaAux = JSON.parse(JSON.stringify(qMeasureTemplate));
                        qMeaAux.qDef.qLabel = value.label;
                        qMeaAux.qDef.qDef = value.measure;
                        qMeaAux.qDef.pColor = value.qDef.pColor ? value.qDef.pColor : "";
                        if (value.qAttributeExpressions) {
                            qMeaAux.qAttributeExpressions.push(value.qAttributeExpressions[0]);
                            qMeaAux.qAttributeExpressions.push(value.qAttributeExpressions[1]);
                        }
                        qMeasures.push(qMeaAux);
                    }
                });

                // $scope.backendApi.applyPatches([
                //     {
                //         "qPath": "/cube2/qHyperCubeDef/qMeasures",
                //         "qOp": "replace",
                //         "qValue": JSON.stringify(qMeasures)
                //     }
                // ], false);
            });
            $scope.$watchCollection("layout.cube2.qHyperCube.qDataPages", function (newVal) {
                angular.element(document).ready(function () {
                    $scope.qDataPagesCube2[0] = JSON.parse(JSON.stringify($scope.layout.cube2.qHyperCube.qDataPages[0]));
                    $scope.GroupDataChart();
                    $scope.LoadCharts("");
                });
            });
            // ------------------------------- 


            // -------------------------------  CHART
            angular.element(document).ready(function () {
                if ($scope.qDataPagesCube2.length == 0) {
                    $scope.qDataPagesCube2.push(JSON.parse(JSON.stringify($scope.layout.cube2.qHyperCube.qDataPages[0])));
                }
                $scope.GroupDataChart();
                $timeout(function () {
                    $scope.LoadCharts("documentReady");
                }, 1000);
            });
            // ------------------------------- 
            $scope.currentPage = 1;
            $scope.qDataPagesCube2 = [];
            $scope.NextPageCube2 = function () {
                let requestPage = [{
                    qTop: $scope.layout.cube2.qHyperCube.qDataPages[0].qArea.qHeight * $scope.currentPage,
                    qLeft: 0,
                    qWidth: $scope.layout.cube2.qHyperCube.qDataPages[0].qArea.qWidth,
                    qHeight: $scope.layout.cube2.qHyperCube.qDataPages[0].qArea.qHeight
                }];

                $scope.ext.model.getHyperCubeData('/cube2/qHyperCubeDef', requestPage).then(function (value) {
                    if ($scope.qDataPagesCube2.length == $scope.currentPage) {
                        $scope.qDataPagesCube2.push(value[0]);
                    } else {
                        $scope.qDataPagesCube2[$scope.currentPage] = value[0];
                    }
                    $scope.currentPage += 1;
                    $scope.GroupDataChart();
                    $timeout(function () {
                        $scope.LoadCharts("");
                    }, 1000);
                });
            };
            // ------------------------------- 
            $scope.GroupDataChart = function () {
                if ($scope.layout.cube2.qHyperCube.qDimensionInfo.length > 0) {
                    if ($scope.qDataPagesCube2[0].qMatrix[0].length > 2) {
                        let qMatrixCopy = [];
                        angular.forEach($scope.qDataPagesCube2, function (qDataPage, key) {
                            qMatrixCopy.push.apply(qMatrixCopy, JSON.parse(JSON.stringify(qDataPage.qMatrix)));
                        });
                        var groups = qMatrixCopy.reduce(function (obj, item) {
                            obj[item[0].qText] = obj[item[0].qText] || [];
                            obj[item[0].qText].push(item);
                            return obj;
                        }, {});
                        $scope.cube2Grouped = Object.keys(groups).map(function (key) {
                            return { name: key, data: groups[key] };
                        });

                        angular.forEach($scope.cube2Grouped, function (value, key) {
                            value.data.sort(function compare(a, b) {
                                if (a[1].qNum < b[1].qNum)
                                    return -1;
                                if (a[1].qNum > b[1].qNum)
                                    return 1;
                                return 0;
                            });
                        });
                    }
                }
                //console.log("cube2Grouped", $scope.cube2Grouped);
            };
            // ------------------------------- 
            var charts = [];
            var canvas = [];
            // ---------------------------
            $scope.ClearCharts = function () {
                angular.forEach(charts, function (chart, key) {
                    let ctx = canvas[key][0].getContext('2d');
                    ctx.clearRect(0, 0, 0, 0);
                    chart.destroy();
                });
            };
            // ------------------------------- 
            $scope.LoadCharts = function (test) {
                //console.log(test);
                $scope.ClearCharts();
                let key = $scope.layout.qInfo.qId;
                let dimLength = $scope.layout.cube2.qHyperCube.qDimensionInfo.length;
                let meaLength = $scope.layout.cube2.qHyperCube.qMeasureInfo.length;

                angular.forEach($scope.cube2Grouped, function (group, key) {
                    let seriesAux = [];
                    let categoriesAux = [];

                    seriesAux.push({
                        name: $scope.layout.cube2.qHyperCube.qMeasureInfo[0].qFallbackTitle,
                        data: [],
                        lineWidth: $scope.layout.props.chartLineWidth,
                        lineColor: $scope.layout.cube2.qHyperCube.qMeasureInfo[0].pColor || $scope.layout.props.chartLineColor
                    });

                    angular.forEach(group.data, function (item, key) {
                        let yAux = parseFloat(item[dimLength].qText.replace(',', ''));
                        seriesAux[0].data.push({
                            y: yAux == 0 ? null : yAux,
                            marker: {
                                fillColor: item[dimLength].qAttrExps != null && item[dimLength].qAttrExps.qValues[0].qText ? item[dimLength].qAttrExps.qValues[0].qText : "rgba(0,0,0,0)",
                                lineColor: item[dimLength].qAttrExps != null && item[dimLength].qAttrExps.qValues[1].qText ? item[dimLength].qAttrExps.qValues[1].qText : "rgba(0,0,0,0)",
                                lineWidth: 2,
                                states: {
                                    hover: {
                                        fillColor: item[dimLength].qAttrExps != null && item[dimLength].qAttrExps.qValues[0].qText ? item[dimLength].qAttrExps.qValues[0].qText : "rgba(0,0,0,0)",
                                        lineColor: item[dimLength].qAttrExps != null && item[dimLength].qAttrExps.qValues[1].qText ? item[dimLength].qAttrExps.qValues[1].qText : "rgba(0,0,0,0)",
                                        radius: $scope.layout.props.chartPointHoverRadius
                                    }
                                }
                            }
                        });
                        categoriesAux.push(item[dimLength - 1].qText);
                    });

                    $(".chart2-" + group.name).each(function () {
                        Highcharts.chart({
                            chart: {
                                type: "line",
                                renderTo: this,
                                backgroundColor: 'rgba(255, 255, 255, 0.0)'
                            },
                            title: {
                                text: null
                            },
                            yAxis: {
                                title: null,
                                labels: {
                                    enabled: false
                                },
                                visible: false
                            },
                            xAxis: {
                                title: null,
                                labels: {
                                    enabled: false
                                },
                                visible: false,
                                categories: categoriesAux
                            },
                            series: seriesAux,
                            legend: {
                                enabled: false
                            },
                            plotOptions: {
                                series: {
                                    marker: {
                                        enabled: true,
                                        radius: $scope.layout.props.chartPointRadius
                                    }
                                }
                            },
                            credits: { enabled: false }
                        });
                    });
                });


            };
            // ------------------------------- 


            // ------------------------------- Extra
            $scope.GoUrl = function (id) {
                if (id.length > 0) {
                    app.field($scope.layout.props.chartfield).selectMatch(id, !1);
                    qlik.navigation.gotoSheet($scope.layout.props.selectedSheet);
                }
            };
            // ------------------------------- iFrame
            $scope.sFrame = false;
            $scope.origin = document.location.origin;
            $scope.protocol = document.location.protocol;
            $scope.ShowFrame = function (id) {
                $scope.sFrame = true;

                //$scope.idk = $scope.origin + $scope.layout.props.urlIframe + id;

                app.field("KPI_ID").selectMatch(id, !1);

                app.visualization.get('DmEgZQe').then(function (vis) {
                    vis.show("QV01" + $scope.kpiTableId);
                });
                app.visualization.get('aEyjJ').then(function (vis) {
                    vis.show("QV02" + $scope.kpiTableId);
                });
                app.visualization.get('Mjkjwcr').then(function (vis) {
                    vis.show("QV04" + $scope.kpiTableId);
                });
                app.visualization.get('SjjZWsE').then(function (vis) {
                    vis.show("QV05" + $scope.kpiTableId);
                });
                app.visualization.get('adaAmT').then(function (vis) {
                    vis.show("QV06" + $scope.kpiTableId);
                });
                app.visualization.get('USYtzd').then(function (vis) {
                    vis.show("QV07" + $scope.kpiTableId);
                });
                app.visualization.get('EbZfLZT').then(function (vis) {
                    vis.show("QV08" + $scope.kpiTableId);
                });
                app.visualization.get('JTMxZMZ').then(function (vis) {
                    vis.show("QV11" + $scope.kpiTableId);
                });
                app.visualization.get('hKzwRPz').then(function (vis) {
                    vis.show("QV12" + $scope.kpiTableId);
                });
                app.visualization.get('wzqLmCR').then(function (vis) {
                    vis.show("QV13" + $scope.kpiTableId);
                });
                app.visualization.get('Pppvm').then(function (vis) {
                    vis.show("QV14" + $scope.kpiTableId);
                });
                app.visualization.get('CGzSJqk').then(function (vis) {
                    vis.show("QV15" + $scope.kpiTableId);
                });
                app.visualization.get('uEEjd').then(function (vis) {
                    vis.show("QV16" + $scope.kpiTableId);
                });
                app.visualization.get('JbEZRf').then(function (vis) {
                    vis.show("QV17" + $scope.kpiTableId);
                });
                app.visualization.get('pzFnee').then(function (vis) {
                    vis.show("QV19" + $scope.kpiTableId);
                });
                app.visualization.get('rkQusU').then(function (vis) {
                    vis.show("QV20" + $scope.kpiTableId);
                });
            };
            // -------------------------------

            // ------------------------------- Header Fix
            angular.element(document).ready(function () {
                $('#container-' + $scope.layout.qInfo.qId).scroll(moveScroll);
            });
            // -------------------------------
            function moveScroll() {
                var containerId = '#container-' + $scope.layout.qInfo.qId;
                var tableContainerId = '#table-container-' + $scope.layout.qInfo.qId;
                var tableId = '#table-' + $scope.layout.qInfo.qId;

                var clone_table = $("#clone");
                let containerTop = $(containerId).offset().top;
                let scroll = $(containerId).scrollTop();
                let anchor_top = $(tableId).offset().top;

                if ($(tableId).width() != $("#clone").width()) {
                    $("#clone").remove();
                }
                if (scroll + containerTop > anchor_top) {
                    clone_table = $("#clone");
                    if (clone_table.length == 0) {
                        clone_table = $(tableId).clone();
                        clone_table.attr('id', 'clone');
                        clone_table.css({
                            position: 'fixed',
                            'pointer-events': 'none',
                            top: containerTop
                        });
                        clone_table.width($(tableId).width());
                        $(tableContainerId).append(clone_table);
                        $("#clone").css({ visibility: 'hidden' });
                        $("#clone thead").css({ visibility: 'visible' });
                    }
                } else {
                    $("#clone").remove();
                }
            }
            // -------------------------------
        }]
    };
});