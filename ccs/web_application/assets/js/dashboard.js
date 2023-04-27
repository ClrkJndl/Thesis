const fs = require('fs');

const data = fs.readFileSync('./data/output/clean_data.csv', {
	encoding: 'utf8',
	flag: 'r'
});

const program_enrolled = {
	labels: [],
	data: [],
	responses: 0
};
const ages = {
	labels: [],
	data: [],
	responses: 0
};
const year_level = {
	labels: [],
	data: [],
	responses: 0
};
const genders = {
	labels: [],
	data: [],
	responses: 0
};
const educations = {
	labels: [],
	data: [],
	responses: 0
};

// columns 5 to 9
// Program enrolled to educational background

for (const line of data.split('\n').splice(3)) {
	if (line.trim() !== '') {
		const splitLine = line.split('","');
		const enrolled = splitLine[5].trim();
		const age = splitLine[6].trim();
		const level = splitLine[7].trim();
		const gender = splitLine[8].trim();
		const education = splitLine[9].trim();

		upsertSection(program_enrolled, enrolled);
		upsertSection(ages, age);
		upsertSection(year_level, level);
		upsertSection(genders, gender);
		upsertSection(educations, education);
	}
}

function upsertSection(section, data) {
	if (data !== '') {
		if (!section.labels.some((e) => e === data)) {
			section.labels.push(data);
			section.data.push(1);
		} else {
			const index = section.labels.indexOf(data);
			section.data[index] += 1;
		}
		section.responses += 1;
	}
}

const result = { program_enrolled, ages, year_level, genders, educations };
console.log(JSON.stringify(result));
