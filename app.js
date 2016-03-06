var flightData = [];
var tripData = [];
var oneFlightHourValue = [100, 50, 25, 15, 7.25];
var oneTripDayValue = [200, 100, 50, 25, 12.5];
var flightMetric = 3;
var tripMetric = 3;
var minFlightTime;
var minPriceForMinFlightTime;
var maxTripTime;
var minPriceForMaxTripTime;

//Chart for flight duration vs. price
var flightChart = new CanvasJS.Chart("chartContainerFlight",
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
      toolTipContent: "<span style='\"'color: {color};'\"'><strong>Travel Time:</strong> {x} hours <br/> <strong>Price:</strong> ${y}<br/></span><strong>Departure: </strong> {departure}<br/> <strong>Return: </strong>{return} <br/><strong>Airline: </strong>{airline}<br/>", 
      dataPoints: []
    } ]
  });

//Chart for duration at destination vs. flight
var tripChart = new CanvasJS.Chart("chartContainerTrip",
    {
      zoomEnabled: true,
      animationEnabled: true,
      title:{
      text: "Price vs. Time at Destination"
    },
    axisX: {
      title:"Total time at destination (days)",
      valueFormatString: "#0.#",
      maximum: 9,
      minimum: 4,
      interval: 1,
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
      toolTipContent: "<span style='\"'color: {color};'\"'><strong>Trip Duration:</strong> {x} days <br/> <strong>Price:</strong> ${y}<br/></span><strong>Departure: </strong> {departure}<br/> <strong>Return: </strong>{return} <br/><strong>Airline: </strong>{airline}<br/> <strong>Z: </strong>{z}",  
      dataPoints: []
    } ]
  });

var initData = function() {
  $.getJSON('http://localhost:3000/data', function(data) {
    findMins(data);
    findFlightZ();
    findTripZ();
    flightData = setColors(flightData);
    tripData = setColors(tripData);
  }).done(function() {
     flightChart.options.data[0].dataPoints = flightData;
     flightChart.render();
     tripChart.options.data[0].dataPoints = tripData;
     tripChart.render();
  });
}

var findMins = function(data) {
  minFlightTime = parseFloat(data[0].flightTime);
  minPriceForMinFlightTime = parseFloat(data[0].price);
  maxTripTime = parseFloat(data[0].destinationTime);
  minPriceForMaxTripTime = minPriceForMinFlightTime;
  for (var i = 0; i < data.length; i++) {
    var flightTime = parseFloat(data[i].flightTime);
    var price = parseFloat(data[i].price);
    var tripTime = parseFloat(data[i].destinationTime);
    if(flightTime < minFlightTime || (flightTime === minFlightTime && price < minPriceForMinFlightTime)) {
      minFlightTime = flightTime;
      minPriceForMinFlightTime = price; 
    }
    flightData.push({ departure: data[i].departure, return: data[i].return, airline: data[i].airline, x: flightTime, y: price });
    if(maxTripTime < tripTime || (tripTime === maxTripTime && price < minPriceForMaxTripTime)) {
      maxTripTime = tripTime;
      minPriceForMaxTripTime = price;
    }
    tripData.push({ departure: data[i].departure, return: data[i].return, airline: data[i].airline, x: tripTime, y: price });
  }
}

var findFlightZ = function() {
  for (var i = 0; i < flightData.length; i++) { 
    var extraTime = flightData[i].x - minFlightTime;
    var priceDecrease = minPriceForMinFlightTime - flightData[i].y;
    var z = priceDecrease - (oneFlightHourValue[flightMetric - 1] * extraTime);
    flightData[i].z = z;
  }
}

var findTripZ = function() {
  for (var i = 0; i < tripData.length; i++) {
    var decreaseTime = maxTripTime - tripData[i].x;
    var priceDecrease = minPriceForMaxTripTime - tripData[i].y;
    var z = priceDecrease - (oneTripDayValue[tripMetric - 1] * decreaseTime);
    tripData[i].z = z;
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

var setColors = function(data) {
  data.sort(compare);
  for (var i = 0; i < data.length; i++) {
    if (i < data.length/3) {
      data[i].color = "#c70000";
      data[i].z = (data[i].z/4.0);
    } else if (i < (data.length/3)*2) {
      data[i].color = "#FFEE2E";
      data[i].z = (data[i].z/2.0);
    } else {
      data[i].color = "green";
    }
  }
  return data;
}

var onFlightInput = function(value) {
  flightMetric = value;
  findFlightZ();
  flightData = setColors(flightData);
  flightChart.options.data[0].dataPoints = flightData;
  $('#flighttimemoney').text(value);
}

var onTripInput = function(value) {
  tripMetric = value;
  findTripZ();
  tripData = setColors(tripData);
  $('#triptimemoney').text(value);
}

$('#flighttimemoneyselector').on('input', function(){
    onFlightInput(this.value);
    flightChart.render();
});

$('#triptimemoneyselector').on('input', function(){
    onTripInput(this.value);
    tripChart.render();
});
