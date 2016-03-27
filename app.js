var flightData = [];
var oneFlightHourValue = [100, 50, 25, 15, 7.25];
var flightMetric = 3;
var minFlightTime;
var minPriceForMinFlightTime;
var RED = "#FAC0AF";
var YELLOW = "#FAF9AF";
var GREEN = "#167D16";

//Chart for flight duration vs. price
var flightChart = new CanvasJS.Chart("chartContainerFlight",
    {
      zoomEnabled: true,
      animationEnabled: true,
      title: {
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
      fillOpacity: .9,
      type: "bubble",
      toolTipContent: "<span style='\"'color: {color};'\"'></span><strong>Travel Time:</strong> {x} hours <br/> <strong>Price:</strong> ${y}<br/><strong>Departure: </strong> {departure}<br/> <strong>Return: </strong>{return} <br/><strong>Airline: </strong>{airline}<br/>", 
      dataPoints: []
    } ]
  });

//Sends get request to server for JSON, calls functions to manipulate data and render
var initData = function() {
  $.getJSON('http://localhost:3000/data', function(data) {
    findMins(data);
    findFlightZ(); 
    flightData = setColors(flightData); 
    displayBest(bestFlight(flightData));
  }).done(function() {
     flightChart.options.data[0].dataPoints = flightData;
     flightChart.render();
  });
}

//Initializes data into javascript objects, finds minimum flight time and prices (needed to calculate bubble size)
var findMins = function(data) {
  minFlightTime = parseFloat(data[0].flightTime);
  minPriceForMinFlightTime = parseFloat(data[0].price);
  for (var i = 0; i < data.length; i++) {
    var flightTime = parseFloat(data[i].flightTime);
    var price = parseFloat(data[i].price);
    if(flightTime < minFlightTime || (flightTime === minFlightTime && price < minPriceForMinFlightTime)) {
      minFlightTime = flightTime;
      minPriceForMinFlightTime = price; 
    }
    flightData.push({ departure: data[i].departure, return: data[i].return, airline: data[i].airline, x: flightTime, y: price, id:i }); 
  }
}

//Finds the z (bubble size) for the flight time vs. price chart
var findFlightZ = function() {
  for (var i = 0; i < flightData.length; i++) { 
    var extraTime = flightData[i].x - minFlightTime;
    var priceDecrease = minPriceForMinFlightTime - flightData[i].y;
    var z = priceDecrease - (oneFlightHourValue[flightMetric - 1] * extraTime);
    flightData[i].z = z;
  }
}

//Comparator function to rank objects by their z
function compareZ(a,b) {
  if (a.z < b.z)
    return -1;
  else if (a.z > b.z)
    return 1;
  else 
    return 0;
}

//Comparator function to rank objects by their id
function compareID(a,b) {
  if (a.id < b.id)
    return -1;
  else if (a.id > b.id)
    return 1;
  else 
    return 0;
}

//Sorts the flight data and sets bubble color according to z ranking
var setColors = function(data) {
  data.sort(compareZ);
  for (var i = 0; i < data.length; i++) {
    if (i < data.length/3) {
      data[i].color = RED;   
    } else if (i < (data.length/3)*2) {
      data[i].color = YELLOW;
    } else {
      data[i].color = GREEN;
    }
  }
  return data;
}

//Displays top flight based on user preferences
var bestFlight = function(flight) {
  best = flightData[flightData.length-1];
  bestZ = best.z;
  flightData[flightData.length-1].z = Math.max(bestZ, 300);
  return best;
}

var displayBest = function(bestFlight) {
  $('#bestDeparture').html('<b>Departure:</b> '+ bestFlight.departure);
  $('#bestReturn').html('<b>Return:</b> '+ bestFlight.return);
  $('#bestAirline').html('<b>Airline:</b> ' + bestFlight.airline);
  $('#bestPrice').html('<b>Price:</b> $' + bestFlight.y);
  $('#bestFlightTime').html('<b>Round trip flight duration:</b> ' + bestFlight.x + ' hours');
}

//Called when user changes their flight sensitivity, recalculates z and colors
var onFlightInput = function(value) {
  flightMetric = value;
  findFlightZ();
  flightData = setColors(flightData);
  displayBest(bestFlight(flightData));
  flightChart.options.data[0].dataPoints = flightData;
}

//Event listener for flight sensitivity slider
$('#flighttimemoneyselector').on('input', function(){
    onFlightInput(this.value);
    flightChart.render();
});
