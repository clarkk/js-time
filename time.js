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
	calendar(date){
		let timestamp, datestamp, time, year, month, day, weekday, month_days, month_first_date, month_first_day, month_first_week, is_valid = false;
		const o = {
			is_valid(){
				return is_valid;
			},
			set(date){
				if(date){
					if(typeof date == 'object'){
						year = date.year;
						month = date.month;
						day = date.day;
					}
					else{
						date = parse_date(date);
						year = date[2];
						if(year && year.length == 2) year = '20'+year;
						month = date[1];
						day = date[0];
					}
					timestamp = new Date(year, month - 1, day);
					compile();
				}
				else{
					timestamp = new Date();
					compile(true);
				}
				return this.get();
			},
			month_offset(offset){
				const next_month_days = new Date(year, month + offset, 0).getDate();
				
				if(day > next_month_days) timestamp.setDate(next_month_days);
				timestamp.setMonth(timestamp.getMonth() + offset);
				
				compile(true);
				return this.get();
			},
			get(){
				return Object.freeze({
					datestamp: datestamp,
					time: time,
					year: year,
					month: month,
					day: day,
					month_days: month_days,
					month_first_week: month_first_week,
					month_first_day: month_first_day
				});
			}
		};
		
		o.set(date);
		
		function compile(set){
			if(set){
				year = timestamp.getFullYear();
				month = timestamp.getMonth() + 1;
				day = timestamp.getDate();
			}
			
			time = Math.round(timestamp.getTime() / 1000) - (timestamp.getTimezoneOffset() * 60);
			datestamp = Time.date(time).datestamp;
			
			year = parseInt(year, 10);
			month = parseInt(month, 10);
			day = parseInt(day, 10);
			weekday = timestamp.getDay() || 7;
			
			month_days = new Date(year, month, 0).getDate();
			month_first_date = new Date(year, month - 1, 1);
			month_first_day = month_first_date.getDay() || 7;
			month_first_week = month_first_date.getWeek();
			
			is_valid = year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
		}
		
		return Object.freeze(o);
	},
	date(time, mode=MODE_FULL, apply_timezone){
		if(!locale) throw new Error('Time locale not set');
		
		let date;
		if(time == 'now'){
			date = new Date();
			if(apply_timezone == null || apply_timezone) date.setTime((date.getTime() / 1000 - timezone_offset(date)) * 1000);
		}
		else{
			if(!parseInt(time)) return null;
			
			date = new Date(time * 1000);
			if(apply_timezone) date.setTime((time - timezone_offset(date)) * 1000);
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
		if(apply_timezone) time -= timezone_offset(date);
		return Math.round(time);
	},
	parse(date){
		if(date){
			const c = this.calendar(date);
			if(c.is_valid()) return c.get().time;
		}
		return 0;
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
		
		if(signed) n *= -1;
		
		return n+' '+elapsed_units[unit][get_lang()];
	}
});

function parse_date(date){
	if(date.indexOf('-') > -1) date = date.split('-');
	else{
		date = [
			date.substr(0, 2) || '',
			date.substr(2, 2) || '',
			date.substr(4, 4) || ''
		];
	}
	return date;
}

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

Date.prototype.getWeek = function(){
	const date = new Date(this.getTime());
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
	// January 4 is always in week 1.
	const week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}
})();