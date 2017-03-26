const migrateMarks = (node) => {
  if (!node) {
    return null;
  }
	if (node.content) {
		for (const subNode of node.content) {
			migrateMarks(subNode);
		}
	}
	if (node.marks) {
		node.marks = node.marks.map((mark) => {
			if (!mark._) {
				return mark;
			}
			return {
				type: mark._,
				/*
				attrs: {


				}
				*/
			}
		});
	}
	if (node.slice) {
		migrateMarks(node.slice);
	}
};

exports.migrateMarks = migrateMarks;


const migrateDiffs = (diffs) => {
	for (const diff of diffs) {
		migrateMarks(diff);
	}
};

exports.migrateDiffs = migrateDiffs;
