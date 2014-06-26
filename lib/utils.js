module.exports.parseISODate = function(str) {
    var date = '';
    if (str instanceof Date) {
	return str;
    }
    date += str.substr(0, 4) + '-';
    date += str.substr(4, 2) + '-';
    date += str.substr(6, 2);
    
    if (str.indexOf('T') > -1) {
	date += 'T' + str.substr(9, 2) + ':';
	date += str.substr(11, 2) + ':';
	date += str.substr(13, 2);
	date += str.substr(15);
    }
    
    return new Date(date);
};
module.exports.reduceDay = function(day) {
    if (day.segments && day.segments.length > 0) {
	return day.segments.filter(function(seg) {
	    return seg.type == "move" && seg.activities && seg.activities.length > 0;
	}).map(function(seg) {
	    return seg.activities;
	}).reduce(function(prev, curr, index, arr) {
	    curr.filter(function(act) {
		return act.activity == "cycling";
	    }).forEach(function(el) {
		prev.push(el.trackPoints.map(function(tp) {
		    return {
			lat:tp.lat, 
			lon:tp.lon, 
			timestamp:module.exports.parseISODate(tp.time),
		    };
		}));
	    });
	    return prev;
	}, []);
	
    }
    return [];
    
};
