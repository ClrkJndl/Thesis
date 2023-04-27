const calculate = require('./equation');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const scriptsDir = path.dirname(path.resolve(__filename));
const rawDataDir = args[0] ?? path.join(scriptsDir, '..', 'raw_data');
const savePath = args[1] ?? path.join(scriptsDir, '..', 'datasets.csv');
const headers = [];

const cleanData = [
	// 'Program Enrolled,Age,Year level,Gender,Educational Background,Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Q10,Q11'
];

/**
 * Number representation of string to int from survey.
 */
const evaluation = {
	Understood: 3,
	'Slightly Understood': 2,
	'Not at all': 1
};
const sections = [
	// Program enrolled
	{
		'Bachelor of Science in Computer Science': 1,
		'Bachelor of Science in Information Technology': 2
	},
	,
	// Year level
	{
		'Third Year': 3,
		'Fourth Year': 4
	},
	// Gender
	{
		Male: 1,
		Female: 2,
		'Better not to mention': 3
	},
	// Educational background
	{
		'Senior Highschool Graduate (K-12 Curriculum)': 1,
		'Highschool Graduate (Old Curriculum)': 2
	},
	// Interests
	{
		'Own Interest': 1,
		'In demand course': 2,
		'Enhance programming skills': 3,
		'For a good career in the future': 4,
		'Friends joined to the program': 5,
		'Parents Choice': 6,
		'No other choice': 7
	},
	// Resolving Programming Issues
	{
		'Self learning (reading documents, programming tutorials/demo etc...)': 1,
		'Asking for more examples to your instructor': 2,
		'Lecture/Note taking': 3,
		'Seeking help from friends': 4,
		'Seeking help from your senior years in college': 5
	},
	// Environmental Factors
	{
		'Lack of Device (Laptops/Personal Computers)': 1,
		'Unstable Internet Connection': 2,
		'No Internet Connection': 3,
		'Uncomfortable Environment': 4
	},
	// Academic Aid
	{
		'Demonstration of the lesson': 1,
		'Limited examples given': 2,
		'Mastery of the topic': 3,
		'Irrelevance of the lesson': 4
	},
	// Self Evaluation
	// C++  Programming Language
	evaluation,
	// Java Programming Language
	evaluation,
	// Information Management
	evaluation,
	// Object Oriented Programming
	evaluation,
	// Python Programming Language
	evaluation,
	// Learning MySQL (Database)
	evaluation,
	// Web Development (HTML & CSS)
	evaluation
];

const students = [];
// Read files from raw_data directory
const files = fs.readdirSync(rawDataDir);

const _cl = [];
// Loop files from raw_data directory
for (const [idx, file] of Object.entries(files)) {
	if (file === 'raw_data.csv') {
		const cleanDataFromFile = [];

		// Read csv file
		const data = fs.readFileSync(path.join(rawDataDir, file), {
			encoding: 'utf8',
			flag: 'r'
		});
		const lines = data.split('\n');

		const headerLine = getLine(lines[0]);
		cleanData.push(headerLine.join(','));
		_cl.push(lines[0]);

		// Split data by every end line and remove headers & 2 row data
		for (const line of lines.splice(1)) {
			// Ignore empty lines
			if (line.trim() !== '') {
				// Remove first 5 columns ang 16 columns at the end
				const newLine = getLine(line);

				let result = [];
				const id = line.split('","')[4];
				if (!students.find((e) => e == id) && id.search(regexp) > -1) {
					var regexp = /^[a-zA-Z0-9-_]+$/;
					students.push(id);
					_cl.push(line);

					// Convert string to int
					for (const [index, _val] of Object.entries(newLine)) {
						let value;
						// Remove double quotes
						const val = _val.replace(/\"/g, '');

						// If current index reaches these sections, use equation for calculating unique value of multiple choices.
						if ([5, 6, 7, 8].some((idx) => index == idx)) {
							const choices = val
								.split(';')
								.map(
									(_v) =>
										sections[index][_v] ?? addNewOption(sections[index], _v)
								);
							value = choices.reduce((a, b) => (a += 1), 0);
						} else {
							if (sections[index]) {
								if (sections[index][val]) {
									value = sections[index][val];
								} else {
									// If value cannot be found on constant options, add it.
									value = addNewOption(sections[index], val);
								}
							}
						}

						if (!value) {
							result.push(_val.trim() === '' ? 0 : parseInt(_val));
						} else {
							result.push(value);
						}
					}
				}
				if (result.length) cleanDataFromFile.push(result.join(','));
			}
		}

		// Append new clean data
		if (cleanDataFromFile.length) cleanData.push(cleanDataFromFile.join('\n'));
	}
}

// Join cleanData to a whole string
const newData = cleanData.join('\n');

// Write new csv file using the new datasets
const newFile = savePath;
fs.writeFile(newFile, newData, (err) => {
	if (err) throw err;

	console.log('New dataset successfully saved!');
});

fs.writeFile('./data/output/clean_data.csv', _cl.join('\n'), (err) => {
	if (err) throw err;

	console.log('Raw data successfully cleaned!');
});

// Mutate section
function addNewOption(section, option) {
	const value = Object.entries(section).length + 1;
	section[option] = value;
	return value;
}

function getLine(line) {
	return line.split('","').splice(5).slice(0, -16);
}

// console.log(_cl);
