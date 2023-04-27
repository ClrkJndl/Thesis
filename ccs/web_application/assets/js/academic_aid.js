const fs = require('fs');

const data = fs.readFileSync('./data/output/clean_data.csv', {
	encoding: 'utf8',
	flag: 'r'
});

const genders = {};
const ages = [];
const headers = [];
let responses = 0;
for (const line of data.split('\n').splice(3)) {
	responses++;
	if (line.trim() !== '') {
		const splitLine = line.split('","');
		const gender = splitLine[8];
		const age = splitLine[6];

		const newLine = splitLine.splice(13).slice(0, -23);

		let value;
		if (!genders[gender]) {
			genders[gender] = [];
		}

		// Remove double quotes
		const val = newLine[0].replace(/\"/g, '');
		val.split(';').forEach((_v) => {
			const v = _v.trim();
			let index;
			if (!headers.some((e) => e === v)) {
				if (v !== '') {
					headers.push(v);
					ages.push({
						sum: parseInt(age.trim() === '' ? 0 : age.trim()),
						students: 1
					});
					index = headers.length - 1;
				}
			} else {
				index = headers.indexOf(v);
				ages[index] = {
					sum:
						parseInt(ages[index].sum) +
						parseInt(age.trim() === '' ? 0 : age.trim()),
					students: ages[index].students + 1
				};
			}

			if (genders[gender].length < index + 1) {
				// add empty values until reaches index
				const loop = index + 1 - genders[gender].length;
				for (let i = 0; i < loop; i++) {
					genders[gender].push(0);
				}
			}

			genders[gender][index] += 1;
		});
	}
}

// Fill empty values to 0
Object.entries(genders).forEach(([key, value]) => {
	if (value.length < headers.length) {
		const loop = headers.length - value.length;
		for (let i = 0; i < loop; i++) {
			genders[key].push(0);
		}
	}
});

const academic_aid_total = Object.values(genders).reduce((a, b) => {
	if (a.length > 0) {
		for (const [index, value] of Object.entries(b)) {
			a.splice(index, 1, a[index] + value);
		}
	} else {
		/// IMPORTANT TO AVOID MUTATION
		a = [...b];
	}
	return a;
}, []);

ages.forEach((age, index) => {
	ages[index] = (age.sum / age.students).toFixed(1);
});

const result = { headers, genders, responses, academic_aid_total, ages };
console.log(JSON.stringify(result));
