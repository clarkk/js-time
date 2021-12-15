'use strict';

(function(root){
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
	
	function zerofill(num, width){
		let zeros = Math.max(0, width - Math.floor(num).toString().length);
		return Math.pow(10, zeros).toString().substr(1)+num;
	}
	
	root.Time = {
		init(lang){
			
		},
		time_date(time, mode='full', apply_timezone=false){
			let date = new Date();
			if(time != 'now'){
				if(!parseInt(time)){
					return '';
				}
				
				if(apply_timezone){
					time -= new Date(time * 1000).getTimezoneOffset() * 60;
				}
				
				date.setTime(time * 1000);
			}
			
			let d = get(date);
			
			switch(mode){
				case 'full':
					d.datestamp = zerofill(d.day, 2)+'-'+zerofill(d.month, 2)+'-'+d.year;
					break;
				
				case 'short':
					d.datestamp = zerofill(d.day, 2)+'-'+zerofill(d.month, 2)+'-'+d.year.toString().substr(2, 2);
					break;
				
				default:
					throw Error('Invalid time mode: '+mode);
			}
			
			d.timestamp = d.datestamp+' '+d.time;
			
			return d;
		}
	};
}(this);