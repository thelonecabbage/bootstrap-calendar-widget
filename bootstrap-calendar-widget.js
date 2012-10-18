
; (function ($) {

	var zeroFill = function ( number, width )
	{
	  width -= number.toString().length;
	  if ( width > 0 )
	  {
	    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	  }
	  return number + ""; // always return a string
	};

	var defaults = {
		// default starting date for the calendar
		date: new Date(),
		// table level classes
		tableClass: 'bootstrap-calendar table-condensed table-bordered',
		// forward/backward icon classes
		prevMonthClass: 'icon-backward pull-left',
		nextMonthClass: 'icon-forward pull-right',

		// "month" definition object constructor.  the day value of the date option is ignored
		// replace this with your own method to change the operation or language of the calendar
		month: function (date) {
			var mm = parseInt(date.getMonth(), 10);
			var dd = parseInt(date.getDate(), 10);
			var yyyy = parseInt(date.getFullYear(), 10);
			var dayStart = parseInt((new Date(yyyy +'-' + zeroFill(mm+1,2) + '-1')).getDay(), 10);

			var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
			var shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var days =  [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        	var isLeapYear = function (year) {
          	  return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
        	};
        	if (isLeapYear(yyyy)) days[1] = 29;

        	return {
        		num: mm, // 0-11 month number
        		name: months[mm], // name of THIS month
        		shortName: shortMonths[mm], // short name of THIS month
        		days: days[mm], // total number of days in THIS month
        		year: yyyy,	// 4 digit year of THIS month (years affect months)
        		starts: dayStart, // 0-6 (starting with sunday) that is the 1st of THIS MONTH
        		weekdays: ['Sunday', "Monday", 'Tuesday',"Wednesday", 'Thursday','Friday','Saturday'], // long weekday names
        		shortWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'] // short weekday names
        	};
			
		},
		// title caption of the calendar month + year
		drawTitle: function (month) {
			return '<span class="month">' + month.name + '</span>' + '<span class="year">' + month.year + '</span>';
		},
		// column titles of the calendar
		drawWeekday: function (weekday, month) {
			return month.shortWeekdays[weekday];
		},
		// individual days of the calendar, day class is used for convienence
		drawDay: function (date, month) {
			return '<div class="day">' + parseInt(date.getDate(), 10)  + '</div>';
		},
		// hover callback
		onHover: function (date, $td, month) {
			//console.log('bootstrap-calendar-hover: '+ id.toString());
		},
		// click callback
		onClick: function (date, $td, month) {
			//console.log('bootstrap-calendar-click: '+ id.toString());
		},
		// callback to populate the title, return false for empty
		popoverTitle: function (date, $td, month) {return false},
		// callback to populate the content of the popover, return false to hide
		popoverContent: function (date, $td, month) {return false}

	};

	$.fn.bootstrapCalendar = function (arg) {

		var getId = function (day, month) { return month.year + '-' + zeroFill(month.num + 1, 2) + '-' + zeroFill(day,2); };
		var parseId = function (id) { return new Date(id);};


		var drawCalendar = function (month, options) {
			var daycnt = 0;
			var html = '';
			html += '<table class="' + options.tableClass + '">';
			html += '<caption><a href="#" class="' + options.prevMonthClass + ' prev-month"></a>' + options.drawTitle(month) + '<a href="#" class="' + options.nextMonthClass + ' next-month"></a></caption>';
			html += '<thead><tr>';
			for(var i = 0; i < 7; i++) {
				html += '<th>' + options.drawWeekday(i, month) + '</th>';
			}
			html += '</tr></thead>';

			html += '<tbody><tr>';
			for(var i = 0;i < month.starts; i++) {
				html += '<td></td>';
				daycnt ++;
			}
			for(var i = 1;i <= month.days; i++) {
				var id = getId(i, month);
				var date = parseId(id);
				html += '<td data-id="' + id + '">' + options.drawDay(date, month) + '</td>';
				if (++daycnt % 7 === 0) {
					html +="</tr><tr>";
				}
			}
			html += '</tr></tbody>';
			
			html += '</table>';
			return html;
		};

		this.each(function() {
			var options = $.extend({}, defaults, arg);
	
			var $target = $(this);
			var month = options.month(options.date);
			var $calender = $(drawCalendar(month, options));
			$target.empty();
			$target.append($calender);

			$target.delegate('td[data-id]', 'mouseover', function (e) {
				e.preventDefault();
				var $td = $(this);
				var id = parseId($td.attr('data-id'));
				options.onHover(id, $td, month);
			});
			
			$target.delegate('td[data-id]', 'click', function (e) {
				if($(e).parents('.popover')) return true;
				e.preventDefault();
				var $td = $(this);
				var id = parseId($td.attr('data-id'));
				options.onClick(id, $td, month);
			});

			$target.delegate('a.prev-month', 'click', function (e) {
				e.preventDefault();
				var m = parseInt(options.date.getMonth(), 10);
			 	if (--m < 0) {
			 		m = 11;
			 		var y = parseInt(options.date.getFullYear(), 10);
			 		options.date.setFullYear(--y);
			 	}

			 	options.date.setMonth(m);
			 	month = options.month(options.date);
			 	var $calender = $(drawCalendar(month, options));
				$target.empty();
				$target.append($calender);
			});
			$target.delegate('a.next-month', 'click', function (e) {
				e.preventDefault();
				var m = parseInt(options.date.getMonth(), 10);
			 	m = ++m;
			 	if (m>11) {
			 		m = 0;
			 		var y = parseInt(options.date.getFullYear(), 10);
			 		options.date.setFullYear(++y);
			 	}
			 	options.date.setMonth(m);
			 	month = options.month(options.date);
			 	var $calender = $(drawCalendar(month, options));
				$target.empty();
				$target.append($calender);
			});

			// popover requires the bootstrap popover js loaded.
			if ($target.popover) {
				var popoverContent = null;
				$target.popover({
					selector: 'td[data-id]',
					trigger: 'hover',
					placement: 'in right',
					title: function () {
						var $td = $(this);
						var content = false;
						if (options.popover) {
							var id = parseId($td.attr('data-id'));
							content = options.popover(id, $td, month);
						}
						popoverContent = false;
						if (!content) return false;
						if (content.content) popoverContent = content.content;
						if (content.title) return content.title;
						return false;
					},
					content: function () {
						return popoverContent;
					}
				});
			}

		});
	}

}(window.jQuery));
