const fs = require('fs');

const data = fs.readFileSync('./data/output/clean_data.csv', {
	encoding: 'utf8',
	flag: 'r'
});

const genders = [{}, {}];
const ages = [[], []];
const headers = [[], []];
let responses = 0;
for (const line of data.split('\n').splice(3)) {
	responses++;
	if (line.trim() !== '') {
		const splitLine = line.split('","');
		const gender = splitLine[8];
		const age = splitLine[6];

		const newLine = splitLine.splice(10).slice(0, -25);

		let value;
		for (const [idx, _val] of Object.entries(newLine)) {
			if (!genders[idx][gender]) {
				genders[idx][gender] = [];
			}

			// Remove double quotes
			const val = _val.replace(/\"/g, '');
			val.split(';').forEach((_v) => {
				const v = _v.trim();
				let index;
				if (!headers[idx].some((e) => e === v)) {
					headers[idx].push(v);
					ages[idx].push({
						sum: parseInt(age.trim() === '' ? 0 : age.trim()),
						students: 1
					});
					index = headers[idx].length - 1;
				} else {
					index = headers[idx].indexOf(v);
					ages[idx][index] = {
						sum:
							parseInt(ages[idx][index].sum) +
							parseInt(age.trim() === '' ? 0 : age.trim()),
						students: ages[idx][index].students + 1
					};
				}

				if (genders[idx][gender].length < index + 1) {
					// add empty values until reaches index
					const loop = index + 1 - genders[idx][gender].length;
					for (let i = 0; i < loop; i++) {
						genders[idx][gender].push(0);
					}
				}

				genders[idx][gender][index] += 1;
			});
		}
	}
}

// Fill empty values to 0
genders.forEach((e, idx) => {
	Object.entries(e).forEach(([key, value]) => {
		if (value.length < headers[idx].length) {
			const loop = headers[idx].length - value.length;
			for (let i = 0; i < loop; i++) {
				genders[idx][key].push(0);
			}
		}
	});
});

const student_interest_total = genders.map((e, idx) => {
	return Object.values(e).reduce((a, b) => {
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
});

ages.forEach((e, idx) => {
	e.forEach((age, index) => {
		ages[idx][index] = (age.sum / age.students).toFixed(1);
	});
});

const result = { headers, genders, responses, student_interest_total, ages };
console.log(JSON.stringify(result));
