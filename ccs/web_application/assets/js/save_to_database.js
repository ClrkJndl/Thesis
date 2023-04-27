const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const rawData = args[0];

const data = fs.readFileSync(path.join(rawData), {
	encoding: 'utf8',
	flag: 'r'
});

const students = [];
let responses = 0;
const lines = data.split('\n');

for (const line of lines.splice(1)) {
	responses++;
	if (line.trim() !== '') {
		const split_line = line.split('","');
		const id = split_line[4];
		const gender = split_line[8];
		const program_enrolled = split_line[5];
		const year_level = split_line[7];
		const age = split_line[6] == '' ? 0 : parseInt(split_line[6] ?? 0);

		if (!students.find((e) => e[0] == id)) {
			var regexp = /^[a-zA-Z0-9-_]+$/;
			if (id.search(regexp) > -1) {
				students.push([id, gender, program_enrolled, year_level, age]);
			}
		}
	}
}

const result = { data: students };
console.log(JSON.stringify(result));
