/* *
 *
 *  Highcharts funnel module
 *
 *  (c) 2010-2019 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* eslint indent: 0 */

'use strict';

import Highcharts from '../parts/Globals.js';

/**
 * Internal types
 * @private
 */
declare global {
    namespace Highcharts {
        class FunnelPoint extends PiePoint {
            public dlBox: BFunnelObject;
            public options: FunnelPointOptions;
            public series: FunnelSeries;
        }
        class FunnelSeries extends PieSeries {
            public centerX: number;
            public data: Array<FunnelPoint>
            public options: FunnelSeriesOptions;
            public pointClass: typeof FunnelPoint;
            public points: Array<FunnelPoint>;
            public alignDataLabel(
                point: Point,
                dataLabel: SVGElement,
                options: FunnelSeriesDataLabelsOptionsObject,
                alignTo: BBoxObject,
                isNew?: boolean
            ): void;
            public getWidthAt(y: number): number;
            public getX(y: number, half: boolean, point: FunnelPoint): number;
            public sortByAngle(points: Array<FunnelPoint>): void;
        }
        class PyramidPoint extends FunnelPoint {
            public options: PyramidPointOptions;
            public series: PyramidSeries;
        }
        class PyramidSeries extends FunnelSeries {
            public data: Array<PyramidPoint>;
            public options: PyramidSeriesOptions;
            public pointClass: typeof PyramidPoint;
            public points: Array<PyramidPoint>;
        }
        interface BFunnelObject extends BBoxObject {
            bottomWidth: number;
            topWidth: number;
        }
        interface FunnelPointOptions extends PiePointOptions {
            dataLabels?: FunnelSeriesDataLabelsOptionsObject;
        }
        interface FunnelSeriesDataLabelsOptionsObject
            extends PieSeriesDataLabelsOptionsObject {
            position?: string;
        }
        interface FunnelSeriesOptions extends PieSeriesOptions {
            width?: (number|string);
            neckWidth?: (number|string);
            height?: (number|string);
            neckHeight?: (number|string);
            reversed?: boolean;
            size?: null;
            dataLabels?: FunnelSeriesDataLabelsOptionsObject;
            states?: SeriesStatesOptionsObject<FunnelSeries>;
        }
        interface SeriesStatesHoverOptionsObject {
            borderColor?: ColorType;
            color?: ColorType;
        }
        interface SeriesTypesDictionary {
            funnel: typeof FunnelSeries;
        }
        interface PyramidPointOptions extends FunnelPointOptions {
        }
        interface PyramidSeriesOptions extends FunnelSeriesOptions {
            states?: SeriesStatesOptionsObject<PyramidSeries>;
        }
        interface SeriesTypesDictionary {
            pyramid: typeof PyramidSeries;
        }
    }
}

import U from '../parts/Utilities.js';
const {
    pick
} = U;

import '../parts/Options.js';
import '../parts/Series.js';

// create shortcuts
var seriesType = Highcharts.seriesType,
    seriesTypes = Highcharts.seriesTypes,
    fireEvent = Highcharts.fireEvent,
    addEvent = Highcharts.addEvent,
    noop = Highcharts.noop;

/**
 * @private
 * @class
 * @name Highcharts.seriesTypes.funnel
 *
 * @augments Highcharts.Series
 */
seriesType<Highcharts.FunnelSeries>(
    'funnel',
    'pie',
    /**
     * Funnel charts are a type of chart often used to visualize stages in a
     * sales project, where the top are the initial stages with the most
     * clients. It requires that the modules/funnel.js file is loaded.
     *
     * @sample highcharts/demo/funnel/
     *         Funnel demo
     *
     * @extends      plotOptions.pie
     * @excluding    innerSize,size
     * @product      highcharts
     * @requires     modules/funnel
     * @optionparent plotOptions.funnel
     */
    {

        /**
         * Initial animation is by default disabled for the funnel chart.
         */
        animation: false,

        /**
         * The center of the series. By default, it is centered in the middle
         * of the plot area, so it fills the plot area height.
         *
         * @type    {Array<number|string>}
         * @default ["50%", "50%"]
         * @since   3.0
         */
        center: ['50%', '50%'],

        /**
         * The width of the funnel compared to the width of the plot area,
         * or the pixel width if it is a number.
         *
         * @type  {number|string}
         * @since 3.0
         */
        width: '90%',

        /**
         * The width of the neck, the lower part of the funnel. A number defines
         * pixel width, a percentage string defines a percentage of the plot
         * area width.
         *
         * @sample {highcharts} highcharts/demo/funnel/
         *         Funnel demo
         *
         * @type  {number|string}
         * @since 3.0
         */
        neckWidth: '30%',

        /**
         * The height of the funnel or pyramid. If it is a number it defines
         * the pixel height, if it is a percentage string it is the percentage
         * of the plot area height.
         *
         * @sample {highcharts} highcharts/demo/funnel/
         *         Funnel demo
         *
         * @type  {number|string}
         * @since 3.0
         */
        height: '100%',

        /**
         * The height of the neck, the lower part of the funnel. A number
         * defines pixel width, a percentage string defines a percentage of the
         * plot area height.
         *
         * @type {number|string}
         */
        neckHeight: '25%',

        /**
         * A reversed funnel has the widest area down. A reversed funnel with
         * no neck width and neck height is a pyramid.
         *
         * @since 3.0.10
         */
        reversed: false,

        /**
         * To avoid adapting the data label size in Pie.drawDataLabels.
         * @ignore-option
         */
        size: true as any,

        dataLabels: {
            connectorWidth: 1,
            verticalAlign: 'middle'
        },

        /**
         * Options for the series states.
         */
        states: {
            /**
             * @excluding halo, marker, lineWidth, lineWidthPlus
             * @apioption plotOptions.funnel.states.hover
             */

            /**
             * Options for a selected funnel item.
             *
             * @excluding halo, marker, lineWidth, lineWidthPlus
             */
            select: {
                /**
                 * A specific color for the selected point.
                 *
                 * @type {Highcharts.ColorString|Highcharts.GradientColorObject|Highcharts.PatternObject}
                 */
                color: '${palette.neutralColor20}',

                /**
                 * A specific border color for the selected point.
                 *
                 * @type {Highcharts.ColorString}
                 */
                borderColor: '${palette.neutralColor100}'
            }
        }
    },
    // Properties
    {
        animate: noop as any,

        // Overrides the pie translate method
        translate: function (this: Highcharts.FunnelSeries): void {

            var sum = 0,
                series = this,
                chart = series.chart,
                options = series.options,
                reversed = options.reversed,
                ignoreHiddenPoint = options.ignoreHiddenPoint,
                plotWidth = chart.plotWidth,
                plotHeight = chart.plotHeight,
                cumulative = 0, // start at top
                center: Array<(number|string)> = options.center as any,
                centerX = getLength(center[0], plotWidth),
                centerY = getLength(center[1], plotHeight),
                width = getLength(options.width, plotWidth),
                tempWidth,
                height = getLength(options.height, plotHeight),
                neckWidth = getLength(options.neckWidth, plotWidth),
                neckHeight = getLength(options.neckHeight, plotHeight),
                neckY = (centerY - height / 2) + height - neckHeight,
                data = series.data,
                path: Highcharts.SVGPathArray,
                fraction,
                half = (
                    (options.dataLabels as any).position === 'left' ?
                        1 :
                        0
                ),
                x1: number,
                y1: number,
                x2: number,
                x3: number,
                y3: number,
                x4: number,
                y5: (number|null);

            /**
             * Get positions - either an integer or a percentage string must be
             * given.
             * @private
             * @param {number|string|undefined} length
             *        Length
             * @param {number} relativeTo
             *        Relative factor
             * @return {number}
             *         Relative position
             */
            function getLength(
                length: (number|string|undefined),
                relativeTo: number
            ): number {
                return (/%$/).test(length as any) ?
                    relativeTo * parseInt(length as any, 10) / 100 :
                    parseInt(length as any, 10);
            }

            series.getWidthAt = function (
                this: Highcharts.FunnelSeries,
                y: number
            ): number {
                var top = (centerY - height / 2);

                return (y > neckY || height === neckHeight) ?
                    neckWidth :
                    neckWidth + (width - neckWidth) *
                        (1 - (y - top) / (height - neckHeight));
            };

            series.getX = function (
                this: Highcharts.FunnelSeries,
                y: number,
                half: boolean,
                point: Highcharts.FunnelPoint
            ): number {
                return centerX + (half ? -1 : 1) *
                    ((series.getWidthAt(reversed ? 2 * centerY - y : y) / 2) +
                    (point.labelDistance as any));
            };

            // Expose
            series.center = [centerX, centerY, height];
            series.centerX = centerX;

            /*
            Individual point coordinate naming:

            x1,y1 _________________ x2,y1
                \                         /
                \                       /
                \                     /
                \                   /
                    \                 /
                x3,y3 _________ x4,y3

            Additional for the base of the neck:

                    |               |
                    |               |
                    |               |
                x3,y5 _________ x4,y5

            */

            // get the total sum
            data.forEach(function (point: Highcharts.FunnelPoint): void {
                if (!ignoreHiddenPoint || point.visible !== false) {
                    sum += point.y as any;
                }
            });

            data.forEach(function (point: Highcharts.FunnelPoint): void {
                // set start and end positions
                y5 = null;
                fraction = sum ? (point.y as any) / sum : 0;
                y1 = centerY - height / 2 + cumulative * height;
                y3 = y1 + fraction * height;
                tempWidth = series.getWidthAt(y1);
                x1 = centerX - tempWidth / 2;
                x2 = x1 + tempWidth;
                tempWidth = series.getWidthAt(y3);
                x3 = centerX - tempWidth / 2;
                x4 = x3 + tempWidth;

                // the entire point is within the neck
                if (y1 > neckY) {
                    x1 = x3 = centerX - neckWidth / 2;
                    x2 = x4 = centerX + neckWidth / 2;

                // the base of the neck
                } else if (y3 > neckY) {
                    y5 = y3;

                    tempWidth = series.getWidthAt(neckY);
                    x3 = centerX - tempWidth / 2;
                    x4 = x3 + tempWidth;

                    y3 = neckY;
                }

                if (reversed) {
                    y1 = 2 * centerY - y1;
                    y3 = 2 * centerY - y3;
                    if (y5 !== null) {
                        y5 = 2 * centerY - y5;
                    }
                }

                // save the path
                path = [
                    'M',
                    x1, y1,
                    'L',
                    x2, y1,
                    x4, y3
                ];
                if (y5 !== null) {
                    path.push(x4, y5, x3, y5);
                }
                path.push(x3, y3, 'Z');

                // prepare for using shared dr
                point.shapeType = 'path';
                point.shapeArgs = { d: path };


                // for tooltips and data labels
                point.percentage = fraction * 100;
                point.plotX = centerX;
                point.plotY = (y1 + (y5 || y3)) / 2;

                // Placement of tooltips and data labels
                point.tooltipPos = [
                    centerX,
                    point.plotY
                ];

                point.dlBox = {
                    x: x3,
                    y: y1,
                    topWidth: x2 - x1,
                    bottomWidth: x4 - x3,
                    height: Math.abs(pick(y5, y3) - y1),
                    width: NaN
                };

                // Slice is a noop on funnel points
                point.slice = noop as any;

                // Mimicking pie data label placement logic
                point.half = half;

                if (!ignoreHiddenPoint || point.visible !== false) {
                    cumulative += fraction;
                }
            });

            fireEvent(series, 'afterTranslate');
        },

        // Funnel items don't have angles (#2289)
        sortByAngle: function (
            this: Highcharts.FunnelSeries,
            points: Array<Highcharts.FunnelPoint>
        ): void {
            points.sort(function (
                a: Highcharts.FunnelPoint,
                b: Highcharts.FunnelPoint
            ): number {
                return (a.plotY as any) - (b.plotY as any);
            });
        },

        // Extend the pie data label method
        drawDataLabels: function (
            this: Highcharts.FunnelSeries
        ): void {
            var series = this,
                data = series.data,
                labelDistance: number =
                    (series.options.dataLabels as any).distance,
                leftSide,
                sign,
                point,
                i = data.length,
                x,
                y;

            // In the original pie label anticollision logic, the slots are
            // distributed from one labelDistance above to one labelDistance
            // below the pie. In funnels we don't want this.
            series.center[2] -= 2 * labelDistance;

            // Set the label position array for each point.
            while (i--) {
                point = data[i];
                leftSide = point.half;
                sign = leftSide ? 1 : -1;
                y = point.plotY;
                point.labelDistance = pick(
                    point.options.dataLabels &&
                    point.options.dataLabels.distance,
                    labelDistance
                );

                series.maxLabelDistance = Math.max(
                    point.labelDistance,
                    series.maxLabelDistance || 0
                );
                x = series.getX(y as any, leftSide as any, point);

                // set the anchor point for data labels
                point.labelPosition = {
                    // initial position of the data label - it's utilized for
                    // finding the final position for the label
                    natural: {
                        x: 0,
                        y: y as any
                    },
                    'final': {
                        // used for generating connector path -
                        // initialized later in drawDataLabels function
                        // x: undefined,
                        // y: undefined
                    },
                    // left - funnel on the left side of the data label
                    // right - funnel on the right side of the data label
                    alignment: leftSide ? 'right' : 'left',
                    connectorPosition: {
                        breakAt: { // used in connectorShapes.fixedOffset
                            x: x + (point.labelDistance - 5) * sign,
                            y: y as any
                        },
                        touchingSliceAt: {
                            x: x + point.labelDistance * sign,
                            y: y as any
                        }
                    }
                };
            }

            seriesTypes[
                (series.options.dataLabels as any).inside ? 'column' : 'pie'
            ].prototype.drawDataLabels.call(this);
        },

        alignDataLabel: function (
            point: Highcharts.FunnelPoint,
            dataLabel: Highcharts.SVGElement,
            options: Highcharts.FunnelSeriesDataLabelsOptionsObject,
            alignTo: Highcharts.BBoxObject,
            isNew?: boolean
        ): void {
            var series = point.series,
                reversed = series.options.reversed,
                dlBox = point.dlBox || point.shapeArgs,
                align = options.align,
                verticalAlign = options.verticalAlign,
                inside =
                    ((series.options || {}).dataLabels || {}).inside,
                centerY = series.center[1],
                pointPlotY = (
                    reversed ?
                        2 * centerY - (point.plotY as any) :
                        point.plotY
                ),
                widthAtLabel = series.getWidthAt(
                    (pointPlotY as any) - dlBox.height / 2 +
                    (dataLabel as any).height
                ),
                offset = verticalAlign === 'middle' ?
                    (dlBox.topWidth - dlBox.bottomWidth) / 4 :
                    (widthAtLabel - dlBox.bottomWidth) / 2,
                y = dlBox.y,
                x = dlBox.x;

            if (verticalAlign === 'middle') {
                y = dlBox.y - dlBox.height / 2 + dataLabel.height / 2;
            } else if (verticalAlign === 'top') {
                y = dlBox.y - dlBox.height + dataLabel.height +
                    options.padding;
            }

            if (
                verticalAlign === 'top' && !reversed ||
                verticalAlign === 'bottom' && reversed ||
                verticalAlign === 'middle'
            ) {
                if (align === 'right') {
                    x = dlBox.x - (options.padding as any) + offset;
                } else if (align === 'left') {
                    x = dlBox.x + (options.padding as any) - offset;
                }
            }

            alignTo = {
                x: x,
                y: reversed ? y - dlBox.height : y,
                width: dlBox.bottomWidth,
                height: dlBox.height
            };

            options.verticalAlign = 'bottom';

            // Call the parent method
            if (!inside || point.visible) {
                Highcharts.Series.prototype.alignDataLabel.call(
                    this,
                    point,
                    dataLabel,
                    options,
                    alignTo,
                    isNew
                );
            }

            if (inside) {
                if (!point.visible && point.dataLabel) {
                    // Avoid animation from top
                    point.dataLabel.placed = false;
                }

                // If label is inside and we have contrast, set it:
                if (point.contrastColor) {
                    dataLabel.css({
                        color: point.contrastColor
                    });
                }
            }
        }
    }
);

/* eslint-disable no-invalid-this */
addEvent(Highcharts.Chart, 'afterHideAllOverlappingLabels', function (
    this: Highcharts.Chart
): void {
    this.series.forEach(function (series): void {
        if (
            series instanceof seriesTypes.pie &&
            series.placeDataLabels &&
            !((series.options || {}).dataLabels || {}).inside
        ) {
            series.placeDataLabels();
        }
    });
});

/**
 * A `funnel` series. If the [type](#series.funnel.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.funnel
 * @excluding dataParser, dataURL, stack, xAxis, yAxis
 * @product   highcharts
 * @requires  modules/funnel
 * @apioption series.funnel
 */

/**
 * An array of data points for the series. For the `funnel` series type,
 * points can be given in the following ways:
 *
 * 1.  An array of numerical values. In this case, the numerical values
 * will be interpreted as `y` options. Example:
 *
 *  ```js
 *  data: [0, 5, 3, 5]
 *  ```
 *
 * 2.  An array of objects with named values. The following snippet shows only a
 * few settings, see the complete options set below. If the total number of data
 * points exceeds the series' [turboThreshold](#series.funnel.turboThreshold),
 * this option is not available.
 *
 *  ```js
 *     data: [{
 *         y: 3,
 *         name: "Point2",
 *         color: "#00FF00"
 *     }, {
 *         y: 1,
 *         name: "Point1",
 *         color: "#FF00FF"
 *     }]
 *  ```
 *
 * @sample {highcharts} highcharts/chart/reflow-true/
 *         Numerical values
 * @sample {highcharts} highcharts/series/data-array-of-arrays/
 *         Arrays of numeric x and y
 * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
 *         Arrays of datetime x and y
 * @sample {highcharts} highcharts/series/data-array-of-name-value/
 *         Arrays of point.name and y
 * @sample {highcharts} highcharts/series/data-array-of-objects/
 *         Config objects
 *
 * @type      {Array<number|null|*>}
 * @extends   series.pie.data
 * @excluding sliced
 * @product   highcharts
 * @apioption series.funnel.data
 */

/**
 * Pyramid series type.
 *
 * @private
 * @class
 * @name Highcharts.seriesTypes.pyramid
 *
 * @augments Highcharts.Series
 */
seriesType<Highcharts.PyramidSeries>(
    'pyramid',
    'funnel',
    /**
     * A pyramid series is a special type of funnel, without neck and reversed
     * by default.
     *
     * @sample highcharts/demo/pyramid/
     *         Pyramid chart
     *
     * @extends      plotOptions.funnel
     * @product      highcharts
     * @requires     modules/funnel
     * @optionparent plotOptions.pyramid
     */
    {
        /**
         * The pyramid neck width is zero by default, as opposed to the funnel,
         * which shares the same layout logic.
         *
         * @since 3.0.10
         */
        neckWidth: '0%',

        /**
         * The pyramid neck width is zero by default, as opposed to the funnel,
         * which shares the same layout logic.
         *
         * @since 3.0.10
         */
        neckHeight: '0%',

        /**
         * The pyramid is reversed by default, as opposed to the funnel, which
         * shares the layout engine, and is not reversed.
         *
         * @since 3.0.10
         */
        reversed: true
    }
);

/**
 * A `pyramid` series. If the [type](#series.pyramid.type) option is
 * not specified, it is inherited from [chart.type](#chart.type).
 *
 * @extends   series,plotOptions.pyramid
 * @excluding dataParser, dataURL, stack, xAxis, yAxis
 * @product   highcharts
 * @requires  modules/funnel
 * @apioption series.pyramid
 */

/**
 * An array of data points for the series. For the `pyramid` series
 * type, points can be given in the following ways:
 *
 * 1. An array of numerical values. In this case, the numerical values will be
 *    interpreted as `y` options. Example:
 *    ```js
 *    data: [0, 5, 3, 5]
 *    ```
 *
 * 2. An array of objects with named values. The following snippet shows only a
 *    few settings, see the complete options set below. If the total number of
 *    data points exceeds the series'
 *    [turboThreshold](#series.pyramid.turboThreshold), this option is not
 *    available.
 *    ```js
 *    data: [{
 *        y: 9,
 *        name: "Point2",
 *        color: "#00FF00"
 *    }, {
 *        y: 6,
 *        name: "Point1",
 *        color: "#FF00FF"
 *    }]
 *    ```
 *
 * @sample {highcharts} highcharts/chart/reflow-true/
 *         Numerical values
 * @sample {highcharts} highcharts/series/data-array-of-objects/
 *         Config objects
 *
 * @type      {Array<number|null|*>}
 * @extends   series.pie.data
 * @excluding sliced
 * @product   highcharts
 * @apioption series.pyramid.data
 */

''; // adds doclets above into transpiled file
