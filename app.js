var flightData = [];
var tripData = [];
var oneFlightHourValue = [100, 50, 25, 15, 7.25];
var oneTripDayValue = [250, 150, 75, 30, 12.5];
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
      title: {
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
      toolTipContent: "<span style='\"'color: {color};'\"'><strong>Trip Duration:</strong> {x} days <br/> <strong>Price:</strong> ${y}<br/></span><strong>Departure: </strong> {departure}<br/> <strong>Return: </strong>{return} <br/><strong>Airline: </strong>{airline}<br/>",  
      dataPoints: []
    } ]
  });

//Sends get request to server for JSON, calls functions to manipulate data and render
var initData = function() {
  $.getJSON('http://localhost:3000/data', function(data) {
    findMins(data);
    findFlightZ();
    findTripZ();
    flightData = setColors(flightData);
    tripData = setColors(tripData);
    displayBest(bestFlight(flightData, tripData));
  }).done(function() {
     flightChart.options.data[0].dataPoints = flightData;
     flightChart.render();
     tripChart.options.data[0].dataPoints = tripData;
     tripChart.render();
  });
}

//Initializes data into javascript objects, finds minimum flight/trip times and prices (needed to calculate bubble size)
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
    flightData.push({ departure: data[i].departure, return: data[i].return, airline: data[i].airline, x: flightTime, y: price, id:i });
    if(maxTripTime < tripTime || (tripTime === maxTripTime && price < minPriceForMaxTripTime)) {
      maxTripTime = tripTime;
      minPriceForMaxTripTime = price;
    }
    tripData.push({ departure: data[i].departure, return: data[i].return, airline: data[i].airline, x: tripTime, y: price, id:i });
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

//Finds the z (bubble size) for the trip duration vs. price chart
var findTripZ = function() {
  for (var i = 0; i < tripData.length; i++) {
    var decreaseTime = maxTripTime - tripData[i].x;
    var priceDecrease = minPriceForMaxTripTime - tripData[i].y;
    var z = priceDecrease - (oneTripDayValue[tripMetric - 1] * decreaseTime);
    tripData[i].z = z;
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

//Sorts the flight/trip data and sets bubble color according to z ranking
var setColors = function(data) {
  data.sort(compareZ);
  for (var i = 0; i < data.length; i++) {
    if (i < data.length/3) {
      data[i].color = "#c70000";   
    } else if (i < (data.length/3)*2) {
      data[i].color = "#FFEE2E";
    } else {
      data[i].color = "green";
    }
  }
  return data;
}

//Displays top overall flight based on user preferences
var bestFlight = function(flight, trip) {
  flight.sort(compareID);
  trip.sort(compareID);
  var bestZAvg = (flight[1].z + trip[1].z)/2;
  var bestZFlight = flight[1];
  bestZFlight.tripDuration = trip[1].x;
  for (var i = 0; i < flight.length; i++) {
    var zAvg = (flight[i].z + trip[i].z)/2.0;
    if (zAvg > bestZAvg) {
      bestZAvg = zAvg;
      bestZFlight = flight[i];
      bestZFlight.tripDuration = trip[i].x;
    }
  }
  return bestZFlight;
}

var displayBest = function(bestFlight) {
  $('#bestDeparture').text("Departure: " + bestFlight.departure);
  $('#bestReturn').text("Return: " + bestFlight.return);
  $('#bestAirline').text("Airline: " + bestFlight.airline);
  $('#bestPrice').text("Price: $" + bestFlight.y);
  $('#bestFlightTime').text("Round trip flight duration: " + bestFlight.x + " hours");
  $('#bestTripDuration').text("Total time at destination: " + bestFlight.tripDuration + " days");
}

//Called when user changes their flight sensitivity, recalculates z and colors
var onFlightInput = function(value) {
  flightMetric = value;
  findFlightZ();
  flightData = setColors(flightData);
  displayBest(bestFlight(flightData, tripData));
  flightChart.options.data[0].dataPoints = flightData;
  $('#flightPreference').text("Your preference: " + flightMetric);
}

//Called when user changes their trip duration sensitivity, recalculates z and colors
var onTripInput = function(value) {
  tripMetric = value;
  findTripZ();
  tripData = setColors(tripData);
  displayBest(bestFlight(flightData, tripData));
  tripChart.options.data[0].dataPoints = tripData;
  $('#tripPreference').text("Your preference: " + tripMetric);
}

//Event listener for flight sensitivity slider
$('#flighttimemoneyselector').on('input', function(){
    onFlightInput(this.value);
    flightChart.render();
});

//Event listener for trip duration sensitivity slider
$('#triptimemoneyselector').on('input', function(){
    onTripInput(this.value);
    tripChart.render();
});
