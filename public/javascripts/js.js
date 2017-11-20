var menuState = false;

function menuToggle(x)
{
	if (x === undefined)
	{
		if(menuState)
		{
			document.getElementById("slide-menu-container").style.left = "0";
			document.getElementById("header").style.left = document.getElementById("slide-menu-container").offsetWidth + "px";
			menuState = false;
		}
		else
		{
			document.getElementById("slide-menu-container").style.left = -document.getElementById("slide-menu-container").offsetWidth + "px";
			document.getElementById("header").style.left = "0px";
			menuState = true;
		}
	}
	else
	{
		if(x)
		{
			document.getElementById("slide-menu-container").style.left = "0";
			document.getElementById("header").style.left = document.getElementById("slide-menu-container").offsetWidth + "px";
		}
		else
		{
			document.getElementById("slide-menu-container").style.left = -document.getElementById("slide-menu-container").offsetWidth + "px";
			document.getElementById("header").style.left = "0px";
		}
		menuState = !x;
	}
}

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

	//console.log(xDiff);

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
        if ( xDiff > 10 && menuState === false) {
            menuToggle();
        } else if  (xDiff < -10 && menuState === true) {
            menuToggle();
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
}


$(document).ready(function(){
	$.validate({
    lang: 'en',
	modules : 'date, sanitize, security',
	onModulesLoaded : function() {
	var optionalConfig = {
	  fontSize: '12pt',
	  padding: '4px',
	  bad : 'Very bad',
	  weak : 'Weak',
	  good : 'Good',
	  strong : 'Strong'
	};
	$('input[name="userpassword_confirmation"]').displayPasswordStrength(optionalConfig);
	}
  });
  $('#postDescription').restrictLength( $('#max-length-element') );
});

$.formUtils.addValidator({
  name : 'futuredate',
  validatorFunction : function(value, $el, config, language, $form)
  {
	var d = new Date(value);
	var now = new Date();
	if (d > now)
	{
		return true;
	}
	else
	{
		return false;
	}
  },
  errorMessage : 'Date must be in the future',
  errorMessageKey: 'badDateNotFuture'
});


$(function () {
	$("#postEndLocation").geocomplete({
	  details: ".geo-details",
	  detailsAttribute: "data-geo"
	});
});

$( function() {
    $( "#datePicker" ).datepicker();
  } );


$(function() {
	$('#timePicker').timepicker({ 'forceRoundTime': true ,'timeFormat': 'G:i'});
});
