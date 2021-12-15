'use strict';

(function(root){
	let locale;
	
	root.Time = {
		init(lang){
			switch(lang){
				case 'da':
					locale = 'da-DK';
					break;
				
				case 'en':
					locale = 'en-US';
					break;
				
				default:
					throw Error('Invalid time lang: '+lang);
			}
		},
		
		date(time, mode='full', apply_timezone){
			if(!locale){
				throw Error('Time locale not set');
			}
			
			let date;
			if(time != 'now'){
				if(!parseInt(time)){
					return '';
				}
				
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
			
			let d = get(date);
			switch(mode){
				case 'full':
					d.datestamp = zerofill(d.day, 2)+'-'+zerofill(d.month, 2)+'-'+d.year;
					break;
				
				case 'short':
					d.datestamp = zerofill(d.day, 2)+'-'+zerofill(d.month, 2)+'-'+d.year.toString().substr(2, 2);
					break;
				
				case 'weekday':
					d.datestamp = ucfirst(date.toLocaleDateString(locale, {weekday : 'short'}))+' '+d.day+'/'+d.month;
					break;
				
				default:
					throw Error('Invalid time mode: '+mode);
			}
			
			d.timestamp = d.datestamp+' '+d.time;
			
			return d;
		}
	};
	
	function get(date){
		let hour = date.getUTCHours(), min = date.getUTCMinutes(), sec = date.getUTCSeconds();
		return {
			year : date.getUTCFullYear(),
			month : date.getUTCMonth() + 1,
			day : date.getUTCDate(),
			hour : hour,
			min : min,
			sec : sec,
			weekday : date.getUTCDay(),
			time : zerofill(hour, 2)+':'+zerofill(min, 2),
			timesec : zerofill(hour, 2)+':'+zerofill(min, 2)+':'+zerofill(sec, 2)
		};
	}
	
	function timezone_offset(date){
		return date.getTimezoneOffset() * 60;
	}
	
	
	function ucfirst(str){
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	
	function zerofill(num, width){
		let zeros = Math.max(0, width - Math.floor(num).toString().length);
		return Math.pow(10, zeros).toString().substr(1)+num;
	}
})(this);