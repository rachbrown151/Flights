var currData;

var initData = function() {
  $.getJSON('http://localhost:3000/data', function(data) {
    currData = data.sort(comparePrice);
    var dataHTML = toHTML();
    $('#flights').html(dataHTML);
  });
}

//Comparator function to rank objects by their price
function comparePrice(a,b) {
  var aPrice = parseFloat(a.price);
  var bPrice = parseFloat(b.price);
  if (aPrice < bPrice) {
    return -1;
  } else if (aPrice > bPrice)
    return 1;
  else
    return 0;
}

//Comparator function to rank objects by their duration
function compareDuration(a,b) {
  var aTime = parseFloat(a.flightTime);
  var bTime = parseFloat(b.flightTime);
  if (aTime < bTime)
    return -1;
  else if (aTime > bTime)
    return 1;
  else
    return 0;
}

//var htmlTemplate = '<div id = 'departure'></div><div id = 'arrival'></div><div id = 'price'></div><div id='airline'></div><div id = 'duration'></div>';

//Creates currData in html
var toHTML = function() {
  var html = '';
  for (var i = 0; i < currData.length; i++) {
    html += 'Departure: ' + currData[i].departure + '<br>';
    html += 'Return: ' + currData[i].return + '<br>';
    html += 'Price: $' + currData[i].price + '<br>';
    html += 'Airline: ' + currData[i].airline + '<br>';
    html += 'Duration: ' + currData[i].flightTime + ' hours <br>';
    html += '<br><br>'
  }
  return html;
}  

var priceClick = function() {
  currData = currData.sort(comparePrice);
  var dataHTML = toHTML();
  $('#flights').html(dataHTML);
}

var durationClick = function() {
  currData = currData.sort(compareDuration);
  var dataHTML = toHTML();
  $('#flights').html(dataHTML);
}
