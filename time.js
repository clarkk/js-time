(function(){
'use strict';

const LANG_DA='da', LANG_EN='en',
	MODE_FULL='full', MODE_SHORT='short', MODE_WEEKDAY='weekday';

let locale, elapsed_units = {
	days: {
		value: 60 * 60 * 24,
		[LANG_DA]: 'dage',
		[LANG_EN]: 'days'
	},
	hours: {
		value: 60 * 60,
		[LANG_DA]: 'timer',
		[LANG_EN]: 'hours'
	},
	minutes: {
		value: 60,
		[LANG_DA]: 'minutter',
		[LANG_EN]: 'minutes'
	},
	seconds: {
		value: 1,
		[LANG_DA]: 'sekunder',
		[LANG_EN]: 'seconds'
	}
};

window.Time = Object.freeze({
	init(lang){
		switch(lang){
		case LANG_DA:
			locale = LANG_DA+'-DK';
			break;
		case LANG_EN:
			locale = LANG_EN+'-US';
			break;
		default:
			throw new Error('Invalid time lang: '+lang);
		}
	},
	date(time, mode=MODE_FULL, apply_timezone){
		if(!locale) throw new Error('Time locale not set');
		
		let date;
		if(time != 'now'){
			if(!parseInt(time)) return '';
			
			date = new Date(time * 1000);
			if(apply_timezone){
				date.setTime((time - timezone_offset(date)) * 1000);
			}
		}
		else{
			date = new Date();
			if(apply_timezone == null || apply_timezone){
				date.setTime((date.getTime() / 1000 - timezone_offset(date)) * 1000);
			}
		}
		
		let d = get_date(date);
		switch(mode){
		case MODE_FULL:
			d.datestamp = zerofill(d.day, 2)+'-'+zerofill(d.month, 2)+'-'+d.year;
			break;
		case MODE_SHORT:
			d.datestamp = zerofill(d.day, 2)+'-'+zerofill(d.month, 2)+'-'+d.year.toString().substr(2, 2);
			break;
		case MODE_WEEKDAY:
			d.datestamp = ucfirst(date.toLocaleDateString(locale, {weekday: MODE_SHORT}))+' '+d.day+'/'+d.month;
			break;
		default:
			throw new Error('Invalid time mode: '+mode);
		}
		
		d.timestamp = d.datestamp+' '+d.time;
		
		return d;
	},
	time(apply_timezone){
		let date = new Date(), time = date.getTime() / 1000;
		if(apply_timezone){
			time -= timezone_offset(date);
		}
		return Math.round(time);
	},
	elapsed(time, min_time=1){
		let signed = (time < 0), n = 0, scale = 0, unit;
		
		time = Math.max(min_time, Math.abs(time));
		
		for(let k in elapsed_units){
			scale = time / elapsed_units[k].value;
			
			if(scale >= 1){
				n = Math.round(scale);
				time = time % elapsed_units[k].value;
				unit = k;
				break;
			}
		}
		
		if(signed){
			n *= -1;
		}
		
		return n+' '+elapsed_units[unit][get_lang()];
	}
});

function get_date(date){
	let hour = date.getUTCHours(), min = date.getUTCMinutes(), sec = date.getUTCSeconds(), time = zerofill(hour, 2)+':'+zerofill(min, 2);
	return {
		year: date.getUTCFullYear(),
		month: date.getUTCMonth() + 1,
		day: date.getUTCDate(),
		hour: hour,
		min: min,
		sec: sec,
		weekday: date.getUTCDay(),
		time: time,
		timesec: time+':'+zerofill(sec, 2)
	};
}

function get_lang(){
	return locale.split('-')[0];
}

function timezone_offset(date){
	return date.getTimezoneOffset() * 60;
}

function ucfirst(s){
	return s.charAt(0).toUpperCase()+s.slice(1);
}

function zerofill(n, width){
	let zeros = Math.max(0, width - Math.floor(n).toString().length);
	return Math.pow(10, zeros).toString().substr(1)+n;
}
})();