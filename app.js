var flightData = [];

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
      maximum: 32,
      minimum: 15,
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
      minimum: 500,
      maximum: 1000,
      interval: 50
    },
    data: [
    {
      fillOpacity: .7,
      type: "bubble",
      toolTipContent: "<span style='\"'color: {color};'\"'><strong>{label}</strong></span><br/> <strong>Travel Time</strong> {x} hours <br/> <strong>Price</strong> ${y}<br/>",
      dataPoints: []
    } ]
  });

var initData = function() {
  $.getJSON('http://localhost:3000/data', function(data) {
    for (var i = 0; i < data.length; i++) {
      var z = parseInt(data[i].z);
      var color = "green";
      if ( z <= data.length / 3.0 ) {
        color = "#c70000";
      } else if ( z <= 2 * ( data.length / 3.0 ) ) {
        color = "#FFEE2E";
      }
      flightData.push({ label: data[i].label, x: parseInt(data[i].x), y: parseInt(data[i].y), z: parseInt(data[i].z), color:color });
    }
  }).done(function() {
     chart.options.data[0].dataPoints = flightData;
     chart.render(); 
  });
}

var onInput = function(value) {
  $('#timemoney').text(value);
}

$('#timemoneyselector').on('input', function(){
    onInput(this.value);
});

var metricCalculator = function(value){
  
}

$(document).ready(function() {
  metricCalculator();
});
