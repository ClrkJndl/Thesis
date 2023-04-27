const fs = require('fs');

const data = fs.readFileSync('./data/upload/grades.csv', {
	encoding: 'utf8',
	flag: 'r'
});

const _data = {};
let responses = 0;
const lines = data.split('\n');

// Get headeres
const headers = getLine(lines[0]).map((e) => e.replace(/\"/g, '').trim());

for (const line of lines.splice(1)) {
	responses++;
	if (line.trim() !== '') {
		const gender = line.split('","')[2];
		const splitLine = getLine(line);

		for (const [idx, _val] of Object.entries(splitLine)) {
			const val = _val.replace(/\"/g, '').trim();
			const property = headers[parseInt(idx)];
			const props = _data[headers[idx]] ?? {};
			const props_gender = props[val] ?? {};
			_data[headers[idx]] = {
				...props,
				[val]: {
					...props_gender,
					[gender]: props_gender[gender] ? props_gender[gender] + 1 : 1
				}
			};
		}
	}
}

function getLine(line) {
	return line.split('","').splice(6);
}

const result = { data: _data, subjects: headers, responses };
console.log(JSON.stringify(result));
