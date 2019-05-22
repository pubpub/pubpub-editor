const steps = [
	{ stepType: 'replace', from: 1, to: 1, slice: { content: [{ type: 'text', text: 'A' }] } },
	{ stepType: 'replace', from: 2, to: 2, slice: { content: [{ type: 'text', text: 'a' }] } },
	{ stepType: 'replace', from: 2, to: 3 },
	{ stepType: 'replace', from: 1, to: 2 },
	{ stepType: 'replace', from: 1, to: 1, slice: { content: [{ type: 'text', text: 'B' }] } },
	{ stepType: 'replace', from: 2, to: 2, slice: { content: [{ type: 'text', text: 'b' }] } },
];

export default steps;

/*
INVERTED VERSION OF EACH STEP
-----
{"stepType":"replace","from":1,"to":1,"slice":{"content":[{"type":"text","text":"A"}]}}
{"stepType":"replace","from":1,"to":2}
-----
{"stepType":"replace","from":2,"to":2,"slice":{"content":[{"type":"text","text":"a"}]}}
{"stepType":"replace","from":2,"to":3}
-----
{"stepType":"replace","from":2,"to":3}
{"stepType":"replace","from":2,"to":2,"slice":{"content":[{"type":"text","text":"a"}]}}
-----
{"stepType":"replace","from":1,"to":2}
{"stepType":"replace","from":1,"to":1,"slice":{"content":[{"type":"text","text":"A"}]}}
-----
{"stepType":"replace","from":1,"to":1,"slice":{"content":[{"type":"text","text":"B"}]}}
{"stepType":"replace","from":1,"to":2}
-----
{"stepType":"replace","from":2,"to":2,"slice":{"content":[{"type":"text","text":"b"}]}}
{"stepType":"replace","from":2,"to":3}

*/


/*
CALCULATED ADJUSTMENTS

{"stepType":"replace","from":1,"to":1,"slice":{"content":[{"type":"text","text":"A"}]}}
A
{"stepType":"replace","from":2,"to":2,"slice":{"content":[{"type":"text","text":"a"}]}}
Aa
{"stepType":"replace","from":2,"to":3}
{"stepType":"replace","from":2,"to":2,"slice":{"content":[{"type":"text","text":"a"}]}}
{"stepType":"addMark","mark":{"type":"strike"},"from":2,"to":3}
Aa
{"stepType":"replace","from":1,"to":2}
{"stepType":"replace","from":1,"to":1,"slice":{"content":[{"type":"text","text":"A"}]}}
{"stepType":"addMark","mark":{"type":"strike"},"from":1,"to":2}
Aa
{"stepType":"replace","from":2,"to":2,"slice":{"content":[{"type":"text","text":"B"}]}}
{"stepType":"addMark","mark":{"type":"strong"},"from":2,"to":3}
{"stepType":"replace","from":4,"to":4,"slice":{"content":[{"type":"text","text":"b"}]}}
{"stepType":"addMark","mark":{"type":"strong"},"from":4,"to":5}

*/


/*
Select/Replace Step
{"stepType":"replace","from":1,"to":1,"slice":{"content":[{"type":"text","text":"E"}]}}
{"stepType":"replace","from":2,"to":2,"slice":{"content":[{"type":"text","text":"a"}]}}
{"stepType":"replace","from":3,"to":3,"slice":{"content":[{"type":"text","text":"g"}]}}
{"stepType":"replace","from":4,"to":4,"slice":{"content":[{"type":"text","text":"l"}]}}
{"stepType":"replace","from":5,"to":5,"slice":{"content":[{"type":"text","text":"e"}]}}
{"stepType":"replace","from":1,"to":6,"slice":{"content":[{"type":"text","text":"track"}]}}
 */
 