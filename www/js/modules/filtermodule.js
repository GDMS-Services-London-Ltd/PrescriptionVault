
app.filter('ageFilter', function() {
     function calculateAge(birthday) { // birthday is a date
         var ageDifMs = Date.now() - birthday.getTime();
         var ageDate = new Date(ageDifMs); // miliseconds from epoch
         return Math.abs(ageDate.getUTCFullYear() - 1970);
     }

     return function(birthdate) { 
        var bdate = new Date(birthdate)
           return calculateAge(bdate);
     }; 
});

app.filter('aptdate', function($filter)
{
 return function(input)
 {
  if(input == null){ return ""; } 
 
  var _date = new Date(input);
  _date = moment(_date).format('DD-MM-YYYY');
 
  return _date.toUpperCase();
 };
});

app.filter('titleCase', function() {
    return function(input) {
      input = input || '';
      return input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };
});

app.filter('distance', function () {
  return function (input) {
    if (input >= 1000) {
        return (input/1000).toFixed(2) + ' Kms.';
    } else {
        return input + ' Mts.';
    }
  }
});
