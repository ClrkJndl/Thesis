module.exports = function (choices) {
	let result = 1;
	let equation = [];

	// Equation (n + x1)(n + x2)... * 0.01
	for (const choice of choices) {
		const no_choices = choices.length;
		result *= no_choices + Number(choice);
		equation.push(`(${no_choices} + ${choice})`);
	}

	return (result * 0.1).toFixed(2);
};
