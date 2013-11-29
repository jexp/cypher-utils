var cypher = require("../lib/cypher_utils");

function assert(expected, value, msg) {
	var e = JSON.stringify(expected);
	var v = JSON.stringify(value);
	if (e != v) {
		console.log("Assertion failed",msg||"","\nvalue:    ",v,"\nexpected: ",e);
		process.exit();
	} else {
		console.log("Ok",msg||"")
	}
}
var utils = new cypher.CypherUtils();

assert({nodes:[{_id: 0, _labels:[], name:"Pet\"er"}],links:[]},
	   utils.parseCreate("create (a {name:'Pet\"er'})"),"node with single string property with inner double quote")

assert({nodes:[{_id: 0, _labels:[], kids:["Oskar","Kalle","Neo"]}],links:[]},
		   utils.parseCreate("create (a {kids:[\"Oskar\",\"Kalle\",\"Neo\"]})"),"node string array property")

assert({nodes:[{_id: 0, _labels:[], kids:["Oskar","Kalle","Neo"]}],links:[]},
		   utils.parseCreate("create (a {kids:['Oskar','Kalle','Neo']})"),"node single quoted string array property")

assert({nodes:[{_id: 0, _labels:[], kids:["Oskar","Kalle","Neo \"The Matrix\" 4j"]}],links:[]},
	   utils.parseCreate("create (a {kids:['Oskar','Kalle','Neo \"The Matrix\" 4j']})"),"node single quoted string array property")

assert({nodes:[{_id: 0, _labels:[], name:"P'et'er"}],links:[]},
	   utils.parseCreate("create (a {name:\"P'et'er\"})"),"node with single string property with inner single quote")

assert({nodes:[{_id: 0, _labels:[]}],links:[]},
       utils.parseCreate("create (a)"),"simple node")

assert({nodes:[{_id: 0, _labels:[]}],links:[]},
	       utils.parseCreate("create (`a b`)"),"node with escape")

assert({nodes:[{_id: 0, _labels:["Person"]}],links:[]},
       utils.parseCreate("create (a:Person)"),"node with label")

assert({nodes:[{_id: 0, _labels:["`Per son`"]}],links:[]},
       utils.parseCreate("create (a:`Per son`)"),"node with escaped label")

assert({nodes:[{_id: 0, _labels:["Person","Father"]}],links:[]},
       utils.parseCreate("create (a:Person:Father)"),"node with two labels")

assert({nodes:[{_id: 0, _labels:["Person"], name:"Peter"}],links:[]},
       utils.parseCreate("create (a:Person {name:'Peter'})"),"node with single string property ")

assert({nodes:[{_id: 0, _labels:[], name:"Pet'er"}],links:[]},
       utils.parseCreate("create (a {name:\"Pet'er\"})"),"node with single string property with single quote") 
	
assert({nodes:[{_id: 0, _labels:["Person"], name:"Peter"}],links:[]},
       utils.parseCreate("create (a:Person {name:\"Peter\"})"),"node with single double quoted string property ")

assert({nodes:[{_id: 0, _labels:["Person"], name:"Peter",age:40,male:true}],links:[]},
       utils.parseCreate("create (a:Person {name:'Peter',age:40, male: true})"),"node with string, boolean, int properties")

assert({nodes:[{_id: 0, _labels:[]},{_id: 1, _labels:[]}],links:[]},
       utils.parseCreate("create (a),(b)"),"two simple nodes")

assert({nodes:[{_id: 0, _labels:["Person"], name:"Peter"},
               {_id: 1, _labels:["Person"], age: 42},],links:[]},
       utils.parseCreate("create (a:Person {name:'Peter'}),(b:Person {age:42})"),"two nodes with single property ")

assert({nodes:[{_id: 0, _labels:["Person"], name:"Peter"},
               {_id: 1, _labels:["Person"], age: 42},],links:[]},
       utils.parseCreate("create (a:Person {name:'Peter'}) CREATE (b:Person {age:42})"),"two creates with nodes with single property ")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a)-[:KNOWS]->(b)"),"two nodes with relationship outgoing")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{_type:"KNOWS",source:1,target:0}]},
       utils.parseCreate("create (a)<-[:KNOWS]-(b)"),"two nodes with relationship incoming")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{since:2000,_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a)-[:KNOWS {since:2000}]->(b)"),"two nodes with relationship and property")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{since:2000,location:"CPH",valid:true,_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a)-[:KNOWS {since:2000, location:'CPH', valid: true}]->(b)"),"two nodes with relationship and properties")

assert({nodes:[{_id: 0, _labels:["Person"], name:"Peter"},
               {_id: 1, _labels:["Person"], age: 42},],
		links:[{_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a:Person {name:'Peter'})-[:KNOWS]->(b:Person {age:42})"),"two nodes with label and properties with relationship")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a), (a)-[:KNOWS]->(b)"),"separate node creation, nodes with relationship and property")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a) create (a)-[:KNOWS]->(b)"),"separate node create (a) for relationship")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a),(b) create (a)-[:KNOWS]->(b)"),"separate node create (a),(b) for relationship")

assert({nodes:[{_id: 0, _labels:[]},
               {_id: 1, _labels:[]}],
		links:[{_type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a)\n create (b) \ncreate (a)-[:KNOWS]->(b)"),"separate node create (a) create (b) create rel")

assert({nodes:[{_id: 0, _name: "a", _labels:[]},
               {_id: 1, _name: "b", _labels:[]}],
		links:[{_name:"rel", _type:"KNOWS",source:0,target:1}]},
       utils.parseCreate("create (a)\n create (b) \ncreate (a)-[rel:KNOWS]->(b)",{keep_names:true}),"keep names of nodes and rels")
