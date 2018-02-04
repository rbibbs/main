function deduplicateTerminals(terminalList) {
	//Check for duplicate words
	var occurrences = {};
	var dedupedTerminals = [];
	for(var i=0; i<terminalList.length; i++){
		var t = terminalList[i];
		//If this is the first occurrence of t, don't append an index
		if(!occurrences.hasOwnProperty(t)){
			dedupedTerminals.push(t);
			occurrences[t] = 1;
		}
		// If we've seen t before, then add an index to it such that the 2nd occurrence of t
		// becomes t_1.
		else{
			dedupedTerminals.push(t+'_'+occurrences[t]);
			occurrences[t] = occurrences[t] + 1;
		}
	}
	return dedupedTerminals;
}

(function() {
var phiNum = 0;
var wNum = 0;

//R/N Update
//takes a list of words and returns the candidate set of trees (JS objects)
window.GEN = function(sTree, words, options){
	options = options || {}; // if options is undefined, set it to an empty object (so you can query its properties without crashing things)
	options.recursiveCat = (options.recursiveCat || "phi");
	
	if(typeof words === "string") { // words can be a space-separated string of words or an array of words; if string, split up into an array
		if (!words) { // if empty, scrape words from sTree
			words = getLeaves(sTree);
			for (var i = 0; i < words.length; i++) {
				words[i] = words[i].id;
			}
		} else {
			words = words.split(' ');
			words = deduplicateTerminals(words);
		}
	} else {
		words = deduplicateTerminals(words);
	}

	var leaves = [];
	phiNum = wNum = 0;
	for(var i=0; i<words.length; i++){
		leaves.push(omegafy(words[i], options));
	}
	
	var recursiveOptions = {};
	for (var k in options) {
		if (options.hasOwnProperty(k) && k !== 'requirePhiStem') // <-- redefine this in terms of recursiveCat
			recursiveOptions[k] = options[k];
	}
	
	var rootlessCand = addPhiWrapped(gen(leaves, recursiveOptions), options);
	
	var candidates = [];
	for(var i=0; i<rootlessCand.length; i++){
		var iota = iotafy(rootlessCand[i], options);
		if (!iota)
			continue;
		if (options.obeysHeadedness && !iotaIsHeaded(iota))
			continue;
		candidates.push([sTree, iota]);
	}
	return candidates;
}

function iotaIsHeaded(pnode) {
	if (pCat.indexOf(pnode) == -1)
	{
		throw "Warning: " + pnode + " is not in prosodic hierarchy. Problems checking for headedness."; // error statement if pnode is not w/in prosodic hierarchy
	}
	var children = pnode.children || [];
	if (pCat.indexOf(pnode) == pCat.length - 1)
	{
		return true;
	}
	else
	{	
	var nextcat = pCat.indexOf(pnode) + 1;
	for (var i = 0; i < children.length; i++)
		if (children[i].cat === nextcat)
			return true;
	return false;
	}
}

function obeysExhaustivity(cat, children) {
	for (var i = 0; i < children.length; i++)
		if (cat !== children[i].cat && pCat.nextLower(cat) !== children[i].cat)
			return false;
	return true;
}

function iotafy(candidate, options){
	var recursiveCat = options.recursiveCat;
	if (pCat.indexOf(recursiveCat) == -1)
	{
		throw "Warning: " + recursiveCat + " is not in prosodic hierarchy. Problem with iotafying."; // error statement if recursiveCat is not w/in prosodic hierarchy
	}
	if (pCat.indexOf(recursiveCat) == 0)
	{
		throw "Warning: " + recursiveCat + " is highest category. Problem with iotafying."; // error statement if recursiveCat is highest category
	}
	var higherCat = pCat.nextHigher(recursiveCat);
	if (options && options.obeysExhaustivity && !obeysExhaustivity(higherCat, candidate))
		return null;
	return {id: higherCat, cat: higherCat, children: candidate}; // Should only get one node from higherCat (check this section if breaking occurs)
}

function omegafy(word, options){
	if (pCat.indexOf(options.recursiveCat) == pCat.length - 1)
	{
		throw "Warning: " + options.recursiveCat + " is already lowest category. Problem with omegafying." // error statement if recursiveCat is lowest category
	}
	return {id: word, cat: pCat.nextLower(options.recursiveCat)};
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

	var recursiveCat = options.recursiveCat;

	//Recursive case: at least 1 word. Consider all candidates where the first i words are grouped together
	for(var i = 1; i <= leaves.length; i++){
	
		var rightsides = addPhiWrapped(gen(leaves.slice(i, leaves.length), options), options);

		//Case 1: the first i leaves attach directly to parent (no phi wrapping)
	
		var leftside = leaves.slice(0,i);
		
		// for case 1, we don't need to check the left side for nonrecursivity, because it's all leaves
		
		//Combine the all-leaf leftside with all the possible rightsides that have a phi at their left edge (or are empty)
		for(var j = 0; j<rightsides.length; j++){
			if(!rightsides[j].length || rightsides[j][0].cat === recursiveCat)
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
//Done replacing 'phi' with recursiveCat
function phiify(candidate, options){
	var recursiveCat = options.recursiveCat;
	if (options.obeysExhaustivity && !obeysExhaustivity(recursiveCat, candidate)) // not doing anything yet, because there's nothing between phi and w
		return null;
	if (options.obeysNonrecursivity)
		for (var i = 0; i < candidate.length; i++)
			if (candidate[i].cat === recursiveCat)
				return null;
	return {id: recursiveCat+(phiNum++), cat: recursiveCat, children: candidate};
}

//Takes a list of candidates and doubles it to root each of them in a phi
function addPhiWrapped(candidates, options){
	var origLen = candidates.length;
	var result = [];
	if (!options.requirePhiStem) {
		result = candidates;
	}
	for(var i=0; i<origLen; i++){
		if(candidates[i].length) {
			var phiNode = phiify(candidates[i], options);
			if (phiNode)
				result.push([phiNode]);
		}
	}
	return result;
}

})();
