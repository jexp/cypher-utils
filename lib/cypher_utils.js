var CypherUtils = function() {
	this.parseCreate = function(cypher) {
		var nodes = {}
		var rels = []
		var PARENS = /(\s*\),?\s*|\s*\(\s*)/;
		function toArray(map) {
			var res = [];
			for (var k in map) {
				if (map.hasOwnProperty(k)) {
					res.push(map[k]);
				}
			}
			return res;
		}
		function splitClean(str, pattern) {
			return str.split(pattern)
			.map(function(s) { return s.trim(); })
			.filter(function(s) { return s.trim().length > 0 && !s.match(pattern); });
		}
		function keyIndex(key,map) {
			var count=0;
			for (k in map) {
				if (key == k) return count;
				count+=1;
			}
			return -1;
		}
		cypher = cypher.replace(/CREATE/ig,"");
		var parts = splitClean(cypher,PARENS);
		// console.log(parts)
		var id=0;
		var lastNode, lastRel;
		var NODE_PATTERN=/^\s*(`[^`]+`|\w+)(:(?:`[^`]+`|[\w:]+))?\s*(\{.+\})?\s*$/;
		var REL_PATTERN=/^(<)?\s*-\s*(?:\[(`[^`]+`|\w+)?\s*(:(?:`[^`]+`|[\w]+))?\s*(\{.+\})?\])?\s*-\s*(>)?$/;
		var PROP_PATTERN=/^\s*`?(\w+)`?\s*:\s*(".+?"|'.+?'|\[.+?\]|.+?)\s*(,\s*|$)/;
		parts.forEach(function(p,i) {
			function parseProps(node,props) {
				var prop = null;
				props = props.substring(1,props.length-1); // eliminat {}
				while (prop = props.match(PROP_PATTERN)) {
					props = props.substring(prop[0].length); // next part
					var value = prop[2].replace(/'(.*?)'/g,'"$1"'); // double quotes for JSON parser
					node[prop[1]]=JSON.parse(value);
				}
				return node;
			}
			function parseInner(m) {
				var name=m[1];
				var labels=[];

				var props=""; // TODO ugly
				if (m.length > 1) {
					if (m[2] && m[2][0]==":") labels = splitClean(m[2],/:/); /*//*/
					else props=m[2] || "";
					if (m.length>2 && m[3] && m[3][0]=="{") props=m[3];
				}

				return parseProps( {_id:id,_name:name,_labels:labels}, props);
			}
			var m = null; 
			if (m = p.match(NODE_PATTERN)) {
				var node = parseInner(m);
				var name=node["_name"];
				delete(node["_name"]); // todo
				if (!nodes[name]) {
					nodes[name]=node;
					id += 1;
				}
				lastNode=name;
				if (lastRel) {
					if (lastRel.source===null) lastRel.source=keyIndex(name,nodes);
					if (lastRel.target===null) lastRel.target=keyIndex(name,nodes);
				}
			} else {
				// console.log(p);
				if (m = p.match(REL_PATTERN)){
					var incoming = m[1]=="<" && m[5]!=">";
					m.splice(5,1); m.splice(1,1);
					var rel=parseInner(m);
					rel["_type"]=rel["_labels"][0];
					delete(rel["_id"]);delete(rel["_name"]);delete(rel["_labels"]);
					rel["source"]= incoming ? null : keyIndex(lastNode,nodes);
					rel["target"]= incoming ? keyIndex(lastNode,nodes) : null;
					lastRel=rel;
					rels.push(rel);
				}
			}
			// console.log(node);
		})
		return {nodes: toArray(nodes), links: rels};
	}
}

if (typeof(exports)!=="undefined") {
	exports.CypherUtils = CypherUtils
}