//NONE OF THIS HAS BEEN TESTED. AT ALL.

/* Assign a violation for every node in sTree of category sCat
whose d edge is not aligned with the d edge of a node in pTree 
of the prosodic category corresponding to s

For every sCat node s in sTree, find a node p in pTree of the proper category
such that the first (for align-left) leaf dominated by s has the same id as
the first leaf dominated by p.

TODO Do we ever want to try to align x0 levels?? Or would we ever have an xp as a leaf?
TODO test this function.
*/
function alignLeft(sTree, pTree, sCat){
	return alignSP(sTree, pTree, sCat, 'left');
}

function alignRight(sTree, pTree, sCat){
	return alignSP(sTree, pTree, sCat, 'right');
}

function alignSP(sTree, pTree, sCat, d){
	var getEdge = (d==="left") ? getLeftEdge : getRightEdge;
	var vCount = 0;
	walkTree(sTree, function(sNode){
		if(sNode.cat !== sCat)	 // only go further if sNode has the category we're interested in
			return;
		var sEdge = getEdge(sNode);
		if(!sEdge)
			sEdge = sNode;	// If sNode is a leaf (which it probably shouldn't be but depending on the tree might be),
								// then look for a p-node that matches sNode itself. TODO is this a good idea?
		var noMatch = true;
		walkTree(pTree, function(pNode){
			if(!catsMatch(sCat, pNode.cat))
				return;
			var pEdge = getEdge(pNode);
			if(!pEdge) 
				pEdge = pNode;	//I'm assuming the leaves are words...
			if(sEdge.id === pEdge.id){
				noMatch = false;
				return false;
			}
		});
		if(noMatch)
			vCount++;
	});
	return vCount;
}

function getLeftEdge(node){
	return getLeaves(node)[0];
}

function getRightEdge(node){
	var leaves = getLeaves(node);
	return leaves[leaves.length-1];
}

function wrap(sTree, pTree, cat){
	var vCount = 0;
	walkTree(sTree, function(sNode){
		if(sNode.cat !== cat)
			return;
		var noMatch = true;
		sLeaves = getLeaves(sNode);
		walkTree(pTree, function(pNode){
			if(!catsMatch(cat, pNode.cat))
				return;
			if(containsIds(getLeaves(pNode), sLeaves)){	// if the current pNode wraps our sNode
				noMatch = false;
				return false;	 // stop looking for a match
			}
		});
		if(noMatch)
			vCount++;
	});
	return vCount;
}

// Returns true if a contains b
// More precisely, if a contains a set of nodes whose ids are identical to the ids of the nodes in b.
function containsIds(a, b){
	for(var i=0; i<=(a.length-b.length); i++){
		var j=0;
		while((j<b.length)&&(a[i+j].id === b[j].id))
			j++;
		if(j===b.length)
			return true;
	}
	return false;
}





/* Binarity that cares about the number of branches */

//sensitive to the category of the parent only (2 branches of any type is acceptable)
function binMinBranches(s, ptree, cat){
	var vcount = 0;
	if(ptree.children && ptree.children.length){
		if(ptree.cat === cat && ptree.children.length===1){
			//logreport("VIOLATION: "+ptree.id+" has only one child");
			vcount++;
		}
		for(var i = 0; i<ptree.children.length; i++){
			vcount += binMinBranches(s, ptree.children[i], cat);
		}
	}
	return vcount;
}

//sensitive to the category of the parent only (2 branches of any type is acceptable)
//categorical evaluation: 1 violation for every super-binary branching node
function binMaxBranches(s, ptree, cat){
	var vcount = 0;
	if(ptree.children && ptree.children.length){
		if(ptree.cat === cat && ptree.children.length>2){
			//logreport("VIOLATION: "+ptree.id+" has "+ptree.children.length+" children!");
			vcount++;
		}
		for(var i = 0; i<ptree.children.length; i++){
			vcount += binMaxBranches(s, ptree.children[i], cat);
		}
	}
	return vcount;
}

//sensitive to the category of the parent only (2 branches of any type is acceptable)
//gradient evaluation: assigns 1 violation for every child past the first 2 ("third-born" or later)
function binMaxBranchesGradient(s, ptree, cat){
	var vcount = 0;
	if(ptree.children && ptree.children.length){
		var numChildren = ptree.children.length;
		if(ptree.cat === cat && numChildren>2){
			var excessChildren = numChildren - 2;
			//logreport(excessChildren+ " VIOLATION(s): "+ptree.id+" has "+numChildren+" children!");
			vcount += excessChildren;
		}
		for(var i = 0; i<ptree.children.length; i++){
			vcount += binMaxBranches(s, ptree.children[i], cat);
		}
	}
	return vcount;
}

/*TRUCKENBRODT-STYLE BINARITY*/

//Parent-category-neutral version of:
//Sandalo & Truckenbrodt 2002: "Max-Bin: P-phrases consist of maximally two prosodic words"
//Assigns a violation for every node in ptree that dominates more than two prosodic words.
function binMax2Words(s, ptree, cat){
	var vcount = 0;
	if(ptree.children && ptree.children.length){
		wDesc = getDescendentsOfCat(ptree, 'w');
		if(ptree.cat === cat && wDesc.length>2){
			//logreport("VIOLATION: "+ptree.id+" dominates "+wDesc.length+" words!");
			vcount++;
		}
		for(var i = 0; i<ptree.children.length; i++){
			vcount += binMax2Words(s, ptree.children[i], cat);
		}
	}
	return vcount;
}

//Gradient version of Truckenbrodt's Maximum Binarity
function binMax2WordsGradient(s, ptree, cat){
	var vcount = 0;
	if(ptree.children && ptree.children.length){
		wDesc = getDescendentsOfCat(ptree, 'w');
		if(ptree.cat === cat && wDesc.length>2){
			//logreport("VIOLATION: "+ptree.id+" dominates "+wDesc.length+" words!");
			vcount += (wDesc.length - 2);
		}
		for(var i = 0; i<ptree.children.length; i++){
			vcount += binMax2WordsGradient(s, ptree.children[i], cat);
		}
	}
	return vcount;
}

//Helper function: given a node x, returns all the descendents of x that have category cat.
//Since this function is designed for use on prosodic trees, it does not take silence into account.
function getDescendentsOfCat(x, cat){
	var descendents = [];
	//logreport("x.cat is "+x.cat+ ", cat is " +cat);
	if(x.children && x.children.length)
	//x is non-terminal
	{
		for(var y=0; y < x.children.length; y++){
			var yDescendents = getDescendentsOfCat(x.children[y], cat);
			for(var i=0; i < yDescendents.length; i++){
				descendents.push(yDescendents[i]);
			}
		}
	}
	else if(x.cat === cat)	// x is a terminal of the right category
	{
		descendents.push(x);
	}
	return descendents;
}

function binMin2Words(s, ptree, cat){
	var vcount = 0;
	if(ptree.children && ptree.children.length){
		wDesc = getDescendentsOfCat(ptree, 'w');
		if(ptree.cat === cat && wDesc.length<2){
			//logreport("VIOLATION: "+ptree.id+" only dominates "+wDesc.length+" words!");
			vcount++;
		}
		for(var i = 0; i<ptree.children.length; i++){
			vcount += binMin2Words(s, ptree.children[i], cat);
		}
	}
	return vcount;
}

function binMin2WordsGradient(s, ptree, cat){
	var vcount = 0;
	if(ptree.children && ptree.children.length){
		wDesc = getDescendentsOfCat(ptree, 'w');
		if(ptree.cat === cat && wDesc.length<2){
			//logreport("VIOLATION: "+ptree.id+" dominates "+wDesc.length+" words!");
			vcount += (2-wDesc.length);
		}
		for(var i = 0; i<ptree.children.length; i++){
			vcount += binMin2WordsGradient(s, ptree.children[i], cat);
		}
	}
	return vcount;
}

/* Binarity constraints that care about the number of leaves 
Note: relies on getLeaves. 
In the future we might want to have structure below the level of the (terminal) word, e.g., feet
and in that case would need a type-sensitive implementation of getLeaves
*/

//INCOMPLETE
function binMinLeaves(s, ptree, cat){
	parentcat = cat[0];
	childcat2 = cat[1];
}

//INCOMPLETE
function binMaxLeaves(s, ptree, cat){

}
/********************
* Some implementations of EqualSisters (Myrberg 2013)
* Myrberg introduces this constraint but doesn't actually define 
* how to count violations if there are more than 2 sisters.
* TODO does the degree of prosodic inequality make a difference to the severity of the violation?
*********************/

/* EqualSisters: looks at the category of the first sister, and assigns a violation 
* for every one of its sisters that doesn't share its category
* A definition probably no one wants but which is not ruled out by the "definitions" that appear in papers
* Markedness only -- just looks at prosody
* s and c are just there to fill out the argument structure for tableau-izing purposes.
*/
function equalSistersFirstPrivilege(s, parent, c){
	var vCount = 0;
	if(parent.children && parent.children.length)
	//pTree is non-terminal
	{
		var cat1 = parent.children[0].cat;
		for(var i=0; i < parent.children.length; i++){
			var child = parent.children[i];
			if(child.cat != cat1)
			{
				logreport.debug("\tVIOLATION: "+child.id+" and "+parent.children[0].id+" are unequal.");
				vCount++;
			}
			vCount += equalSistersFirstPrivilege(s, child, c);
		}
	}
	return vCount;
}

/*EqualSisters: assigns a violation for every (unordered) pair of sisters whose categories don't match
* Probably no one wants this version, either. Predicts "majority rules" effects.
* Markedness only -- just looks at prosody
* s and c are just there to fill out the argument structure for tableau-izing purposes.
*/

function equalSistersPairwise(s, parent, c){
	var vCount = 0;
	if(parent.children && parent.children.length)
	//pTree is non-terminal
	{
		var sisters = parent.children;
		for(var i=0; i < sisters.length; i++){
			var child = sisters[i];
			for(var j=i; j < sisters.length; j++){
				var sister = sisters[j];
				if(child.cat != sister.cat)
				{
					logreport.debug("\tVIOLATION: "+child.id+" and "+sister.id+" are unequal.");
					vCount++;
				}
			}
			vCount += equalSistersPairwise(s, child, c);
		}
	}
	return vCount;
}

//EqualSisters: assigns a violation for every pair of adjacent sister nodes that are not of the same prosodic category
//This is probably the version that actually makes sense.
//Markedness only -- just looks at prosody
//s and c are just there to fill out the argument structure for tableau-izing purposes.
function equalSistersAdj(s, parent, c){
	var vCount = 0;
	if(parent.children && parent.children.length)
	//pTree is non-terminal
	{
		logreport.debug("\tchecking equality of children of "+parent.id);
		for(var i=0; i < parent.children.length; i++){
			var child = parent.children[i];
			if(i<parent.children.length-1)
			{
				var sister = parent.children[i+1];
				if(child.cat != sister.cat)
				{
					logreport.debug("\tVIOLATION: "+child.id+" and "+sister.id+" are unequal.");
					vCount++;
				}
			}
			vCount += equalSistersAdj(s, child, c);
		}
	}
	return vCount;
}

/****************
* Function that implements Exhaustivity, version 1:
* "Assign a violation for every parent-child pair (x,y) such that x is of PH-level n and y is of PH-level n-m, m >= 2."
* Assigns violations based on distance between categories on PH, but otherwise category-insensitive.
* "Vertically categorical"; greater distance between parent and child on PH does not result in higher vcount.
******************/

function exhaust1(s, ptree){
//Assumes trees that obey Layering.
	
	//Base case: if parent is a terminal, return 0 violations.
	if (!ptree.children){
		return 0;
	}
	
	//Recursive case: if parent is non_terminal, find out how many violations are in each of the subtrees rooted in its children.

	if(ptree.children && ptree.children.length){
		var vcount = 0;
		var child;
		for (var i=0; i < ptree.children.length; i++){
			child = ptree.children[i];
			if (ptree.cat!==child.cat && pCat.nextLower(ptree.cat)!==child.cat){
				vcount++;
			}
			vcount += exhaust1(s, child);
		}
		return vcount;
	}
};/***********************
MATCH THEORY constraints
and their numerous helpers
************************/

function getLeaves(x)
//return a list of all the non-silent terminals dominated by a node
{
	var leaves = [];
	if(x.children && x.children.length)
	//x is non-terminal
	{
		for(var y=0; y < x.children.length; y++){
			var yLeaves = getLeaves(x.children[y]);
			for(var i=0; i < yLeaves.length; i++){
				leaves.push(yLeaves[i]);
			}
		}
	}
	else if(!x.silent)	// x is itself a non-silent terminal
	{
		leaves.push(x);
	}
	return leaves;
}

function sameIds(a1, a2)
//helper function to compare two arrays (notably for comparing the children arrays)
//since there isn't a built_in array comparator.
{
	if(a1.length !== a2.length)
		return false;
	
	var i = 0;
	while(i<a1.length){
		if(a1[i].id !== a2[i].id)
			return false;
		i++;
	}
	
	return true;
}


function matchPS(sTree, pParent, pCat)
//Assign a violation for every prosodic node of type pCat in pParent that doesn't have a corresponding syntactic node in sTree, 
//where "corresponding" is defined as: dominates all and only the same terminals, and has the corresponding syntactic category
//Assumes no null terminals.
{
	return matchSP(pParent, sTree, pCat);
}

//Longterm TODO: Technically, Match doesn't compare ordered sets but unordered sets, so for an implementation that wouldn't penalize prosodic scrambling we'd need to sort sParent.children and pParent.children before comparing them.
//TODO: what about null syntactic terminals?? these need to be filtered out of the syntactic input?? write this function later.

function matchSP(sParent, pTree, sCat)
//Assign a violation for every syntactic node of type sCat in sParent that doesn't have a corresponding prosodic node in pTree, 
//where "corresponding" is defined as: dominates all and only the same terminals, and has the corresponding prosodic category
//Assumes no null syntactic terminals.
{
	if(sParent.cat === sCat)
		logreport.debug("\tSeeking match for "+sParent.id + " in tree rooted in "+pTree.id);
	var vcount = 0;
	
	if((sParent.cat === sCat) && !hasMatch(sParent, pTree)){
		vcount++;
		logreport.debug("\tVIOLATION: "+sParent.id+" has no match!");
	} 
		
	if(sParent.children){	
		for(var i = 0; i < sParent.children.length; i++)
		{
			var sChild = sParent.children[i];
			vcount += matchSP(sChild, pTree, sCat);
		}
	}
	
	return vcount;
}

function hasMatch(sNode, pTree)
//For a syntactic node sNode and a prosodic tree pTree, search the entire pTree 
//to see if there is a node in pTree that has the same set of terminals as sNode,
//in the same order as sLeaves.
//Returns true for terminals assuming that there are no null syntactic terminals...
//Relies on sameIds for leaf comparisons and catMatches for category comparisons.
{
	var sLeaves = getLeaves(sNode);
	if(catsMatch(sNode.cat, pTree.cat) && sameIds(getLeaves(pTree), sLeaves))
	// the current prosodic node is the match, both for category and for terminals
	{
		logreport.debug("\tMatch found: "+pTree.id);
		return true;
	}
	
	// If the current prosodic node is NOT the match:
	
	else if(!pTree.children || pTree.children.length===0)
	// current node is terminal
		return false;	

	else
	//the current prosodic node is non-terminal (has children)
	{
		for(var i = 0; i < pTree.children.length; i++)
		//check each child to see if the match exists in the subtree rooted in that child
		{
			var child = pTree.children[i];
			if(hasMatch(sNode, child))
				return true;
		}
		return false;
	}
	
}
/****************
* Function that implements Nonrecursivity, version 1:
* "Assign a violation for every node of category x dominated 
* by another node of category x"
******************/

function nonRec1(s, parent, cat){
//Assumes trees that obey Layering.
	
	//Base case: if parent is a terminal, return 0 violations.
	if (!parent.children){
		return 0;
	}
	
	//Recursive case: if parent is non-terminal, find out how many violations are in each of the subtrees rooted in its children
	var vcount = 0;
	var child;
	
	for (var i=0; i < parent.children.length; i++){
		child = parent.children[i];
		if (parent.cat===cat && child.cat===cat){
			vcount++;
		}		
		vcount+=nonRec1(s, child, cat);
	}
	return vcount;
}


/* Non-recursivity, Truckenbrodt style:
*  "Any two p-phrases that are not disjoint in extension are identical in extension."
*  For every node x of category p dominated by another node y of category p, 
*  assign a violation for every leaf dominated by y that is not also dominated by x.
*/
function nonRecTruckenbrodt(s, parent, cat){
	console.log("looking for nonRecTruckenbrodt violations in prosodic tree "+parent.id);
	if(!parent.children||(parent.children.length===0)){
		return 0;
	}
	
	var vcount=0;
	var child;
	
	for(var i=0; i<parent.children.length; i++){
		child = parent.children[i];
		if(parent.cat===cat && child.cat===cat){
			vcount+=leafDifferenceSize(getLeaves(child), getLeaves(parent));
		}
		vcount+=nonRecTruckenbrodt(s, child, cat);
	}
	return vcount;
}

/*Given arrays x, y, where the elements in x are a subset of the elements in y,
* and the elements in x and y are in the same order, returns the number of elements
* in y that are not also in x.
* TODO Modify this so that it doesn't make all the assumptions above concerning the relationship of x and y.
*/
function leafDifferenceSize(x,y){
	if(!(x instanceof Array) || !(y instanceof Array)){
		console.log("x: "+x);
		console.log("y: "+y);
		throw new Error("Either x or y is not an array");
	}
	return y.length-x.length;
}
	
/* Assign a violation for every node whose leftmost daughter constituent is of type k
*  and is lower in the prosodic hierarchy than its sister constituent immediately to its right: *(Kn Kn-1)
*  Elfner's StrongStart.
*/

function strongStart_Elfner(s, ptree, k){

	//base case: ptree is a leaf or only has one child
	if((!ptree.children) || (ptree.children.length<2)){
		return 0;
	}

	//recursive case: ptree dominates at least two nodes
	var vcount = 0;
	var leftmostCat = ptree.children[0].cat;
	var sisterCat = ptree.children[1].cat;

	if((leftmostCat === k) && (pCat.isLower(leftmostCat, sisterCat)))
		vcount++;
	
	for(var i=0; i<ptree.children.length; i++){
		child = ptree.children[i];
		vcount += strongStart_Elfner(s, child, k);
	}
	
	return vcount;
}
//Ozan's code
function walkTree(node, foo) {
	if (foo(node) === false)
		return;
	if (node.children instanceof Array)
		for (var i = 0; i < node.children.length; i++)
			walkTree(node.children[i], foo);
}

function getLeaves2(root) {
	var leaves = [];
	walkTree(root, function(node) {
		if (!(node.children instanceof Array))
			leaves.push(node);
	});
	return leaves;
}

// matchSP2 and hasMatch2 are equivalents of older versions of matchSP and hasMatch (without category sensitivity)
function matchSP2(sParent, pTree) {
	var vcount = 0;
	walkTree(sParent, function(node) {
		if (!hasMatch2(getLeaves(node), pTree))
			vcount++;
	});
	return vcount;
}

function hasMatch2(sLeaves, pTree) {
	var result = false;
	walkTree(pTree, function(node) {
		if (sameIds(getLeaves(node), sLeaves)) {
			result = true;
			return false; // don't continue tree-traversal
		}
	});
	return result;
}
(function() {
var phiNum = 0;
var wNum = 0;

//takes a list of words and returns the candidate set of trees (JS objects)
window.GEN = function(sTree, words, options){
	options = options || {};
	
	if(typeof words === "string")
		words = words.split(' ');
	
	var leaves = [];
	phiNum = wNum = 0;
	for(var i=0; i<words.length; i++){
		leaves.push(omegafy(words[i]));
	}
	
	var rootlessCand = addPhiWrapped(gen(leaves, options), options);
	
	var candidates = [];
	for(var i=0; i<rootlessCand.length; i++){
		var iota = iotafy(rootlessCand[i], options);
		if (!iota)
			continue;
		if (options.obeysHeadedness && !ioataIsHeaded(iota))
			continue;
		candidates.push([sTree, iota]);
	}
	return candidates;
}

function ioataIsHeaded(ioata) {
	var children = ioata.children || [];
	for (var i = 0; i < children.length; i++)
		if (children[i].cat === 'phi')
			return true;
	return false;
}

function obeysExhaustivity(cat, children) {
	for (var i = 0; i < children.length; i++)
		if (cat !== children[i].cat && pCat.nextLower(cat) !== children[i].cat)
			return false;
	return true;
}

function iotafy(candidate, options){
	if (options && options.obeysExhaustivity && !obeysExhaustivity('i', candidate))
		return null;
	return {id: 'iota', cat: 'i', children: candidate};
}

function omegafy(word){
	return {id: word+'_'+(wNum++), cat: 'w'};
}

// conceptually, returns all possible parenthesizations of leaves that don't have a set of parentheses enclosing all of the leaves
// format: returns an array of parenthesizations, where each parenthesization is an array of children, where each child is
// either a phi node (with descendant nodes attached) or a leaf
function gen(leaves, options){
	var candidates = [];	//each candidate will be an array of siblings
	if(!(leaves instanceof Array))
		throw new Error(leaves+" is not a list of leaves.");	

	//Base case: 0 leaves
	if(leaves.length === 0){
		candidates.push([]);
		return candidates;
	}



	//Recursive case: at least 1 word. Consider all candidates where the first i words are grouped together
	for(var i = 1; i <= leaves.length; i++){

		//Case 1: the first i leaves attach directly to parent (no phi wrapping)
	
		var leftside = leaves.slice(0,i);
		var rightsides = addPhiWrapped(gen(leaves.slice(i, leaves.length), options), options);
		
		// for case 1, we don't need to check the left side for nonrecursivity, because it's all leaves
		
		//Combine the all-leaf leftside with all the possible rightsides that have a phi at their left edge (or are empty)
		for(var j = 0; j<rightsides.length; j++){
			if(!rightsides[j].length || rightsides[j][0].cat === 'phi')
			{
				var cand = leftside.concat(rightsides[j]);
				candidates.push(cand);
			}
		}
	
		
	
		//Case 2: the first i words are wrapped in a phi
		if(i<leaves.length){
			var phiLeftsides = gen(leaves.slice(0,i), options);
			for(var k = 0; k<phiLeftsides.length; k++)
			{
				var phiNode = phiify(phiLeftsides[k], options);
				if (!phiNode)
					continue;
				var leftside = [phiNode];
				
				for(var j = 0; j<rightsides.length; j++)
				{
					cand = leftside.concat(rightsides[j]);
					candidates.push(cand);
				}
			} 
		}
	
	}

	return candidates;
}

function topLevelRecursive(candidate) {
	for (var i = 0; i < candidate.length; i++) {
		var topNode = candidate[i];
		var topChildren = topNode.children || [];
		for (var j = 0; j < topChildren.length; j++)
			if (topNode.cat === topChildren[j].cat)
				return true;
	}
	return false;
}

function phiify(candidate, options){
	if (options && options.obeysExhaustivity && !obeysExhaustivity('phi', candidate)) // not doing anything yet, because there's nothing between phi and w
		return null;
	if (options && options.obeysNonrecursivity)
		for (var i = 0; i < candidate.length; i++)
			if (candidate[i].cat === 'phi')
				return null;
	return {id: 'phi'+(phiNum++), cat: 'phi', children: candidate};
}

//Takes a list of candidates and doubles it to root each of them in a phi
function addPhiWrapped(candidates, options){
	var origLen = candidates.length;
	for(var i=0; i<origLen; i++){
		if(candidates[i].length) {
			var phiNode = phiify(candidates[i], options);
			if (phiNode)
				candidates.push([phiNode]);
		}
	}
	return candidates;
}

})();
//An array of pairs to define which syntactic categories "match" which prosodic categories.
//For theory comparison, we'll want one array for each theory.
var categoryPairings = {
	"clause": "i", 
	"cp": "i",
	"xp": "phi",
	"x0": "w"
};


//Evaluates whether two nodes have corresponding categories.
function catsMatch(aCat, bCat){
	if(aCat === undefined && bCat === undefined)
		return true;	//vacuously true if both nodes are leaves (with no category)
	else if(categoryPairings.hasOwnProperty(aCat))
		return categoryPairings[aCat] === bCat;
	else if(categoryPairings.hasOwnProperty(bCat))
		return categoryPairings[bCat] === aCat;
	else
	{
		//console.warn("Neither argument to catsMatch was a valid syntactic category:", aCat, bCat);	//TODO this gives a false positive warning every time Match PS runs on a tree whose leaves don't have categories.
		return false;
	}
}



//defines the prosodic hierarchy
var pCat = ["i", "phi", "w"];

//Function that compares two prosodic categories and returns whether cat1 is higher in the prosodic hierarchy than cat2
pCat.isHigher = function (cat1, cat2){
	return (pCat.indexOf(cat1) < pCat.indexOf(cat2));
}

// Function that compares two prosodic categories and returns true if cat 1 is lower in the prosodic hierarchy than cat2
pCat.isLower = function (cat1, cat2){
	return (pCat.indexOf(cat1) > pCat.indexOf(cat2));
}

// Function that returns the prosodic category that is one level lower than the given category
pCat.nextLower = function(cat) {
	var i = pCat.indexOf(cat);
	if (i < 0)
		throw new Error(cat + ' is not a prosodic category');
	return pCat[i+1];
}
//pCat(type1).isHigherThan(type2)


var lastSegmentId = 0, nextSegmentToReveal = 0;


var logLines = [];
function logreport(line){
    logLines.push(['<span class="report-line segment-', lastSegmentId, (lastSegmentId >= nextSegmentToReveal) ? ' segment-hidden' : '', '">', line, '<br></span>'].join(''));
    flushLog();
}
logreport.debug = function() {
    if (logreport.debug.on)
        return logreport.call(this, Array.prototype.slice.call(arguments));
}
logreport.debug.on = true;

var resultsContainer;
function flushLog() {
    if (resultsContainer) {
        var fragment = document.createElement('div');
        fragment.innerHTML = logLines.join('');
        resultsContainer.appendChild(fragment);
        logLines = [];
    } else {
        console.error('Tried to flush log before window loaded.');
    }
}

function writeTableau(tableauContent) {
    if (resultsContainer) {
        var tableauContainer = document.createElement('div');

        tableauContainer.innerHTML =  '<h3 style="margin-bottom: 5px">Tableau</h3>';

        var htmlTableauContainer = document.createElement('div');
        htmlTableauContainer.innerHTML = tableauToHtml(tableauContent);
        tableauContainer.appendChild(htmlTableauContainer);		

        var textareaNote = document.createElement('strong');
        textareaNote.innerHTML = 'For copying and pasting into OTWorkplace: ';
        tableauContainer.appendChild(textareaNote);

        var textarea = document.createElement('textarea');
        textarea.className = 'tableau-textarea';
        textarea.value = tableauToCsv(tableauContent, '\t');
        textarea.readOnly = true;
        tableauContainer.appendChild(textarea);
        tableauContainer.className += ' segment-' + lastSegmentId;
        if (lastSegmentId >= nextSegmentToReveal)
            tableauContainer.className += ' segment-hidden';
        onRevealSegment[lastSegmentId] = function() {
            textarea.focus();
            textarea.select();
        }

        resultsContainer.appendChild(tableauContainer);

    } else {
        console.error('Tried to write tableau before window loaded.');
    }
}

window.addEventListener('load', function(){
    resultsContainer = document.getElementById('results-container');
    if(typeof runDemo === 'function')
        runDemo();
});


var onRevealSegment = {};

function revealNextSegment() {
    if (nextSegmentToReveal > lastSegmentId)
        return;
    var elements = document.getElementsByClassName('segment-' + nextSegmentToReveal);
    for (var i = 0; i < elements.length; i++)
        elements[i].className = elements[i].className.replace('segment-hidden', '');

    if (onRevealSegment[nextSegmentToReveal])
        onRevealSegment[nextSegmentToReveal]();

    // window.scrollTo(0, document.body.scrollHeight); //TODO: scroll to top of last segment, not bottom

    nextSegmentToReveal++;
}

document.addEventListener('keyup', function(event) {
    if (event.keyCode === 32)
        revealNextSegment();
});


//Given a string that is the name of a (global) object, returns the object itself.
//Given an object, returns that object.
function globalNameOrDirect(nameOrObject) {
    return (typeof nameOrObject === 'string') ? window[nameOrObject] : nameOrObject;
}

function runConstraint(constraint, sname, pname, cat, expectedViolations) {
    var pTree = globalNameOrDirect(pname);
    logreport(['<span class="main-report-line">Running ', constraint, '(', (cat || ''), ') on (', sname, ', ', parenthesizeTree(pTree), ')', (expectedViolations == null) ? '' : [' - Expected Violations: <span class="expected-violation-count">', expectedViolations, '</span>'].join(''), '</span>'].join(''));
    var violationCount = globalNameOrDirect(constraint)(globalNameOrDirect(sname), pTree, cat);
    logreport(['<span class="main-report-line" style="background-color: white">Actual Violations: <span class="actual-violation-count">', violationCount, '</span></span><br/><br/>'].join(''));
    return violationCount;
}

//Produces an array of arrays representing a tableau

function makeTableau(candidateSet, constraintSet){
	var tableau = [];
	//Make a header for the tableau, containing all the constraint names.
	//First element is empty, to correspond to the column of candidates.
	var header = [candidateSet[0] ? candidateSet[0][0] : ''];
	for(var i=0; i<constraintSet.length; i++){
		header.push(constraintSet[i]);
	}
	tableau.push(header);
	
	//Assess violations for each candidate.
	for(var i = 0; i < candidateSet.length; i++){
		var candidate = candidateSet[i];
		var violations = [parenthesizeTree(globalNameOrDirect(candidate[1]))];
		for(var j = 0; j < constraintSet.length; j++){
			var constraintAndCat = constraintSet[j].split('-');
			// var numViolations = runConstraint(constraintAndCat[0], candidate[0], candidate[1], constraintAndCat[1]); ++lastSegmentId; // show log of each constraint run
			var oldDebugOn = logreport.debug.on; logreport.debug.on = false; var numViolations = globalNameOrDirect(constraintAndCat[0])(globalNameOrDirect(candidate[0]), globalNameOrDirect(candidate[1]), constraintAndCat[1]); logreport.debug.on = oldDebugOn; // don't show the log of each constraint run
			violations.push(numViolations);
		}
		tableau.push(violations);
	}
	return tableau;
}

function tableauToCsv(tableau, separator, options) {
    options = options || {};
	if (!(tableau instanceof Array) || !tableau.length)
		return '';
	var lines = [];
	var synTree = tableau[0][0];
    if(!options.noHeader){
        lines.push('');  // empty first row for regexes
        var headerRow = ['', '', ''].concat(tableau[0].slice(1, tableau[0].length));
        lines.push(headerRow.join(separator));
    }
	for (var i = 1; i < tableau.length; i++) {
		var row = [(i === 1) ? synTree : '', tableau[i][0], ''].concat(tableau[i].slice(1, tableau[i].length));
		// TODO: handle special characters (i.e.: cell values containing either double quotes or separator characters) 
		lines.push(row.join(separator));
	}
	return lines.join('\n');
}

function tableauToHtml(tableau) {
	if (!(tableau instanceof Array))
		return '';
	var htmlChunks = ['<table class="tableau"><thead><tr>'];
	var headers = tableau[0] || [];
	for (var j = 0; j < headers.length; j++) {
		htmlChunks.push('<th>');
		htmlChunks.push(headers[j]);
		htmlChunks.push('</th>');
	}
	htmlChunks.push('</tr></thead><tbody>');
	for (var i = 1; i < tableau.length; i++) {
		htmlChunks.push('<tr>');
		for (var j = 0; j < tableau[i].length; j++) {
			htmlChunks.push(j ? '<td>' : '<td class="candidate">');
			htmlChunks.push(tableau[i][j]);
			htmlChunks.push('</td>');
		}
		htmlChunks.push('</tr>');
	}
	htmlChunks.push('</tbody></table>');
	return htmlChunks.join('');
}
//takes a prosodic tree and returns a string version where phi boundaries are marked with '(' ')'
function parenthesizeTree(tree){
	var parTree = [];
	
	function processNode(node){
		if(node.cat==='phi' || node.cat === 'i'){
			if (node.cat === 'phi')
				parTree.push('(');
			if(node.children instanceof Array){
				for(var i=0; i<node.children.length; i++){
					processNode(node.children[i]);
					if(i<node.children.length-1)
						parTree.push(' ');
				}
			}
			if (node.cat === 'phi')
				parTree.push(')');
		}
		else if(node.cat==='w')
			parTree.push(node.id);
		//	parTree.push(node.id.split('_')[0]);
	}
	
	processNode(tree);
	return parTree.join('');
}
