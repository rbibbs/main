/***********************
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
//helper function to compare two arrays of children
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
