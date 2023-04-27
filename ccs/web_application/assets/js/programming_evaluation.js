const fs = require('fs');

const data = fs.readFileSync('./data/output/clean_data.csv', {
	encoding: 'utf8',
	flag: 'r'
});

const evaluation_choices = {
	Understood: 0,
	'Slightly Understood': 1,
	'Not at all': 2
};

const programming_evaluation = [
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0]
];

const enrolled_bs = {
	'Bachelor of Science in Information Technology': {
		Understood: [0, 0, 0, 0, 0, 0, 0],
		'Slightly Understood': [0, 0, 0, 0, 0, 0, 0],
		'Not at all': [0, 0, 0, 0, 0, 0, 0]
	},
	'Bachelor of Science in Computer Science': {
		Understood: [0, 0, 0, 0, 0, 0, 0],
		'Slightly Understood': [0, 0, 0, 0, 0, 0, 0],
		'Not at all': [0, 0, 0, 0, 0, 0, 0]
	}
};

const genders = {};
const headers = data
	.split('\n')[0]
	.split('","')
	.splice(14)
	.slice(0, -16)
	.map((e) => e.replace(/[\[\]]+/g, '').trim());
for (const line of data.split('\n').splice(3)) {
	if (line.trim() !== '') {
		const splitLine = line.split('","');
		const gender = splitLine[8];
		const enrolled = splitLine[5];

		// Remove first 15 columns ang 16 columns at the end
		const newLine = splitLine.splice(14).slice(0, -16);

		if (!genders[gender]) {
			genders[gender] = {};
		}

		for (const [index, _val] of Object.entries(newLine)) {
			// Remove double quotes
			const val = _val.replace(/\"/g, '');
			const _index = evaluation_choices[val];
			programming_evaluation[_index] = programming_evaluation[_index].map(
				(e, idx) => {
					return idx == index ? e + 1 : e;
				}
			);
			enrolled_bs[enrolled][val] = enrolled_bs[enrolled][val].map((e, idx) =>
				idx == index ? e + 1 : e
			);

			if (!genders[gender][val]) {
				genders[gender][val] = [0, 0, 0, 0, 0, 0, 0];
			}

			genders[gender][val][index] += 1;
		}
	}
}

const result = { headers, programming_evaluation, enrolled_bs, genders };
console.log(JSON.stringify(result));
