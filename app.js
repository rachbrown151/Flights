var flightData = [];
var oneHourValue = [100, 50, 25, 15, 7.25];
var metric = 3;
var minTime;
var minPriceForMinTime;

var chart = new CanvasJS.Chart("chartContainer",
    {
      zoomEnabled: true,
      animationEnabled: true,
      title:{
      text: "Price vs. Flight Duration"
    },
    axisX: {
      title:"Round Trip Flight Time (hours)",
      valueFormatString: "#0.#",
      maximum: 34,
      minimum: 16,
      interval: 2,
      gridThickness: 1,
      tickThickness: 1,
      gridColor: "lightgrey",
      tickColor: "lightgrey",
      lineThickness: 0
    },
    axisY:{
      title: "Flight Cost (dollars)",
      gridThickness: 1,
      tickThickness: 1,
      gridColor: "lightgrey",
      tickColor: "lightgrey",
      lineThickness: 0,
      valueFormatString:"#0.#",
      minimum: 400,
      maximum: 1100,
      interval: 100
    },
    data: [
    {
      fillOpacity: .7,
      type: "bubble",
      toolTipContent: "<span style='\"'color: {color};'\"'><strong>{label}</strong></span><br/> <strong>Travel Time</strong> {x} hours <br/> <strong>Price</strong> ${y}<br/> <strong>Z:</z> {z}<br/>",
      dataPoints: []
    } ]
  });

var initData = function() {
  $.getJSON('http://localhost:3000/data', function(data) {
    findMins(data);
    findZ();
    setColors();
  }).done(function() {
     chart.options.data[0].dataPoints = flightData;
     chart.render(); 
  });
}

var findMins = function(data) {
  minTime = data[0].x;
  minPriceForMinTime = data[0].y;
  for (var i = 0; i < data.length; i++) {
    var x = parseFloat(data[i].x);
    var y = parseFloat(data[i].y);
    if(x < minTime || (x === minTime && y < minPriceForMinTime)) {
      minTime = x;
      minPriceForMinTime = y;
      console.log(minPriceForMinTime);
    }
    flightData.push({ label: data[i].label, x: x, y: y });
  }
}

var findZ = function() {
  for (var i = 0; i < flightData.length; i++) {
    var extraTime = flightData[i].x - minTime;
    var priceDecrease = minPriceForMinTime - flightData[i].y;
    var z = priceDecrease - (oneHourValue[metric - 1] * extraTime);
    flightData[i].z = z;
  }
}

function compare(a,b) {
  if (a.z < b.z)
    return -1;
  else if (a.z > b.z)
    return 1;
  else 
    return 0;
}

var setColors = function() {
  flightData.sort(compare);
  for (var i = 0; i < flightData.length; i++) {
    if (i < flightData.length/3) {
      flightData[i].color = "#c70000";
      flightData[i].z = (flightData[i].z/4.0);
    } else if (i < (flightData.length/3)*2) {
      flightData[i].color = "#FFEE2E";
      flightData[i].z = (flightData[i].z/2.0);
    } else {
      flightData[i].color = "green";
    }
  }
}

var onInput = function(value) {
  metric = value;
  findZ();
  setColors();
  $('#timemoney').text(value);
}

$('#timemoneyselector').on('input', function(){
    onInput(this.value);
    chart.render();
});

$(document).ready(function() {
});
