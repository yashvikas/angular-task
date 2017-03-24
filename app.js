'use strict';

var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
if(is_chrome){
var app = angular.module('NovantasTakeHomeTest', []);
}

app.controller('ChartController', ['$scope', '$http', '$log', '$timeout',
  
  function($scope, $http, $log, $timeout) {
    var DATASETS = ["teletubbies", "pokemon"],
      DEFAULT_DATASET = DATASETS[0],
      COLORS = ["blue", "grey"],
      DEFAULT_COLOR = COLORS[0],
      DEFAULT_SHAPE = "circle",
      POINT_SIZE = 5,
      POINT_RADIUS = POINT_SIZE * POINT_SIZE * Math.PI,
      X_AXIS_LABEL = "Age (Years)",
      Y_AXIS_LABEL = "Height (Meters)",
      SVG_SELECTOR = "#ageHeightChart svg";

    function initScope() {
      $log.debug("Initializing the scope");
      $scope.datasets = DATASETS;
      $scope.selectedDataset = DEFAULT_DATASET;
      $scope.colors = COLORS;
      $scope.selectedColor = DEFAULT_COLOR;
      $scope.view = 'chart';
    }

    function invalidNumber(val) {
      if (isNaN(val))
        return true;

      return false;
    }

    function toPoint(key, x, y, shape, color) {
      if (invalidNumber(x) || invalidNumber(y))
        throw "Invalid x or y values.";

      return {
        "key": key,
        "x": x,
        "y": y,
        "shape": shape || DEFAULT_SHAPE,
        "color": color || DEFAULT_COLOR
      }
    }
function toPointPK(value, shape, color) {
      if (invalidNumber(value[2]) || invalidNumber(value[3]))
        throw "Invalid x or y values.";

      return {
        "key": value[0],
        "x": value[2],
        "y": value[3],
        "shape": shape || DEFAULT_SHAPE,
        "color": color || DEFAULT_COLOR
      }
    }

    function toGroup(key, values, shape, color){
      return {
        "key": key,
        "values": values,
        "shape": shape || DEFAULT_SHAPE,
        "color": color || DEFAULT_COLOR
      }
    }

    function toRow(name, type, age, height) {
      return {
        "name": name,
        "type": type,
        "age": age,
        "height": height
      }
    }
function toRowPK(row,type) {
      return {
        "name": row[0],
        "type": type,
        "age": row[2],
        "height": row[3]
      }
    }

    function getTeletubbiesGroup(data) {
      var values = [],
        color = $scope.selectedColor,
        rows = [],
        group;

      data = data.teletubbies;

      for (var i=0; i < data.length; i++) {
        var row = data[i],
          name = row.name,
          age = row.age,
          height = row.height,
          row = toRow(name, "teletubbies", age, height),
          p;

        try {
          p = toPoint(name, age, height, null, color);
          values.push(p);
          rows.push(row);
        } catch(err) {
          $log.error("Unable to add point to data: " + err);
        }
      }

      $scope.tableRows = rows;
      $scope.$apply();

      group = toGroup("teletubbies", values, null, color);

      return [group];
    }

    function getColumnIndexMap(cols) {
      var map = {};

      for (var i=0; i < cols.length; i++) {
        var id = cols[i];

        map[id] = i;
      }

      return map;
    }

    function getPokemonGroup(data) {
 
   var values = [],
        color = $scope.selectedColor,
        rows = [],
        group;

      data = data.pokemon;
 var dataRows = data.rows;
 
      for (var i=0; i < dataRows.length; i++) {
        var row = dataRows[i];
        row = toRowPK(row, "pokemon");
var p;

        try {
          p = toPointPK(dataRows[i], null, color);
          values.push(p);
          rows.push(row);
        } catch(err) {
          $log.error("Unable to add point to data: " + err);
        }
      }

      $scope.tableRows = rows;
      $scope.$apply();

      group = toGroup("pokemon", values, null, color);

      return [group];
     
    }




    function getData() {
      var data = $scope.data,
        selected = $scope.selectedDataset;

      if (selected === "teletubbies") {
        return getTeletubbiesGroup(data);
      } else if (selected === "pokemon") {
        return getPokemonGroup(data);
      }
    }

    function getTooltipContent(key, x, y, e, g) {
      var key = g.point.key;

      return '<h2>' + key + '</h2>';
    }

    function getChart() {
      var chart = nv.models.scatterChart()
        .forceX([0,10])
        .forceY([0,10])
        .pointRange([POINT_RADIUS, POINT_RADIUS])
        .showDistX(true)
        .showDistY(true)
        .useVoronoi(true)
        .color(d3.scale.category10().range())
        .duration(300);

      chart.dispatch.on('renderEnd', function(){
        console.log('render complete');
      });

      chart.xAxis
        .axisLabel(X_AXIS_LABEL)
        .tickFormat(d3.format('.01f'));

      chart.yAxis
        .axisLabel(Y_AXIS_LABEL)
        .tickFormat(d3.format('.01f'));

      chart.tooltipContent(getTooltipContent);

      d3.select('#ageHeightChart svg')
        .datum(getData)
        .call(chart);

      nv.utils.windowResize(chart.update);

      chart.dispatch.on('stateChange', function(e) { ('New State:', JSON.stringify(e)); });

      return chart;
    }

    function clearSvg() {
      $(SVG_SELECTOR).empty();
    }

    function drawChart() {
      clearSvg();
      nv.addGraph(getChart);
    }

    $http.jsonp('data.json').success(function(data){
      $scope.data = data;
    });


    $scope.showChart = function() {
      $scope.view = "chart";
    }

    $scope.showTable = function() {
      $scope.view = "table";
    }

    /*
     * $watch for changes
     *
     */

    $scope.$watch('data', function(newValue, oldValue) {
      if (!newValue)
        return;

      initScope();
    });

    $scope.$watch('selectedDataset', function(newValue, oldValue) {
      if (!newValue)
        return;

      drawChart();
    });

    $scope.$watch('selectedColor', function(newValue, oldValue) {
      if (!newValue)
        return;

      drawChart();
    });
  }
]);