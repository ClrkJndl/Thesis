const fs = require('fs');

const data = fs.readFileSync('./data/output/clean_data.csv', {
	encoding: 'utf8',
	flag: 'r'
});

const students = [];
const _data = [];
let responses = 0;
const lines = data.split('\n');

// Get headeres
const headers = getLine(lines[0]).map((e) => e.replace(/\"/g, '').trim());

for (const line of lines.splice(1)) {
	responses++;
	if (line.trim() !== '') {
		const splitLine = getLine(line);

		const _obj = {};
		const id = line.split('","')[4];
		if (!students.find((e) => e == id) && id.search(regexp) > -1) {
			var regexp = /^[a-zA-Z0-9-_]+$/;
			students.push(id);
			for (const [idx, _val] of Object.entries(splitLine)) {
				const val = _val.replace(/\"/g, '');
				const property = headers[parseInt(idx)];
				_obj[property] = val;
			}
			_data.push(_obj);
		}
	}
}

function getLine(line) {
	return line.split('","').splice(5).slice(0, -16);
}

const result = { data: _data, responses };
console.log(JSON.stringify(result));
