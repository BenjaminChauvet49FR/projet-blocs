function randomNumber(p_min, p_max) {
  return Math.floor(Math.random() * (p_max - p_min + 1) ) + p_min;
}

function generateRandomPermutation(p_min, p_max) {
	var answer = [];
	for (var i = p_min ; i <= p_max ; i++) {
		answer.push(i);
	}
	var alea, temp;
	for (var i = 0 ; i <= p_max-p_min ; i++) {
		alea = randomNumber(i, p_max-p_min);
		temp = answer[alea];
		answer[alea] = answer[i];
		answer[i] = temp;
	}
	return answer;
}

var gSizeCarpet = 18;
var gNumberSuits = 4;
var gCardsPerSuit = 12;
var gStacks = [];
var gCarpet = [];
var gDeck = [];
var gGenius = {};

// HTML and logic part
function getColour(p_indexCard) {
	return (p_indexCard == -1) ? -1 : (p_indexCard % gNumberSuits);
}

function getNumber(p_indexCard) {
	return (p_indexCard == -1) ? -1 : (Math.floor(p_indexCard/gNumberSuits)+1);
}

// HTML part
function makeCardOutOfSpan(p_span, p_indexCard) {
	if (p_indexCard == -1) {
		p_span.innerHTML = getNumber(p_indexCard);
		p_span.className = "";
		p_span.classList.add("carte");
		p_span.classList.add("carteM1");
	} else {		
		p_span.innerHTML = getNumber(p_indexCard);
		p_span.className = "";
		p_span.classList.add("carte");
		p_span.classList.add("carte"+getColour(p_indexCard));
	}
	
}

function refreshPileAndDraw() {
	var discardSpan = document.getElementById("span_defausse");
	makeCardOutOfSpan(discardSpan, gDiscard[gDiscard.length-1]);
	var deckSpan = document.getElementById("span_pioche");
	deckSpan.innerHTML = "P"+gDeck.length;
	
	const su = getColour(gDiscard[gDiscard.length-1]);
	const nb = getNumber(gDiscard[gDiscard.length-1]);
}

function refreshStack(p_col) {
	var span = document.getElementById("div_tas").children[p_col];
	span.innerHTML = gStacks[p_col];
	span.className = "";
	span.classList.add("carte");
	span.classList.add("carte"+p_col);	
}

//------------------------------
// Setup

function closureClickOnCarpetCard(p_indexCarpet) {
	return function() {		
		playFromCarpet(p_indexCarpet);
	}
}

function replay() {	
	gStacks = [];
	gCarpet = [];
	gDeck = [];
	gDiscard = [-1];
	gDeck = generateRandomPermutation(0, gNumberSuits*gCardsPerSuit-1);
	for (var i = 0 ; i < gSizeCarpet ; i++) {
		gCarpet.push(gDeck.pop());
	}
	for (var i = 0 ; i < gNumberSuits ; i++) {
		gStacks.push(0);
	}


	/* Setup : HTML part */
	var carpetDiv = document.getElementById("div_tapis")
	carpetDiv.innerHTML = "";
	for (var i = 0 ; i < gSizeCarpet ; i++) {
		var span = document.createElement("span");
		makeCardOutOfSpan(span, gCarpet[i]);
		carpetDiv.appendChild(span);
		span.addEventListener("click", closureClickOnCarpetCard(i));
	}
	var stackDiv = document.getElementById("div_tas")
	stackDiv.innerHTML = "";
	for (var col = 0 ; col < gNumberSuits ; col++) {
		var span = document.createElement("span");
		span.innerHTML = gStacks[0];
		span.className = "";
		span.classList.add("carte");
		span.classList.add("carte"+col);
		stackDiv.appendChild(span);
	}
	
	/* Setup : final */
	sortCarpet();
	refreshPileAndDraw();
}


function drawFromDeck() {
	if (gDeck.length > 0) {		
		gDiscard.push(gDeck.pop());
		refreshPileAndDraw();
	}
}

function playFromDiscard() {
	var index = gDiscard[gDiscard.length-1];
	var col = getColour(index);
	var num = getNumber(index);
	if (gStacks[col] + 1 == num) {
		gStacks[col]++;
		gDiscard.pop();
		refreshStack(col);
		refreshPileAndDraw();
		return true;
	}
	return false;
}

function playFromCarpet(p_indexCarpet) {	
	var index = gCarpet[p_indexCarpet];
	var col = getColour(index);
	var num = getNumber(index);
	if (gStacks[col] + 1 == num) {
		gStacks[col]++;
		var newIndex = -1;
		// Completer depuis la defausse
		if (gDiscard.length > 1) { // TODO ATTENTION, gDiscard n'est pas vide pour une raison !
			newIndex = gDiscard.pop();
			refreshPileAndDraw();
		} else if (gDeck.length > 0) {
			newIndex = gDeck.pop();
			refreshPileAndDraw();
		}
		gCarpet[p_indexCarpet] = newIndex;
		var span = document.getElementById("div_tapis").children[p_indexCarpet];
		makeCardOutOfSpan(span, newIndex);
		refreshStack(col);			
	}
}

function sortCarpet() {
	gCarpet.sort(function(cardA, cardB) {
		if (cardA == 0) {
			return -1;
		}
		if (cardB == 0) {
			return 1;
		}
		const colA = getColour(cardA);
		const numA = getNumber(cardA);
		const colB = getColour(cardB);
		const numB = getNumber(cardB);
		const c1 = colA-colB;
		if (c1 != 0) {
			return c1;
		} else {
			return numA-numB;
		}
	});
	// Reset div part
	var divCarpet = document.getElementById("div_tapis");
	for (var i = 0 ; i < gCarpet.length ; i++) {
		makeCardOutOfSpan(divCarpet.children[i], gCarpet[i]);
	}
}

document.getElementById("span_pioche").addEventListener("click", function(event) {
	drawFromDeck();
});
document.getElementById("span_defausse").addEventListener("click", function(event) {
	playFromDiscard();
});

document.getElementById("submit_rejouer").addEventListener("click", function(event) {
	gNumberSuits = parseInt(document.getElementById("input_number_couleurs").value, 10); // Forget the "parseInt" and they'll still be strings !
	gSizeCarpet = parseInt(document.getElementById("input_number_tapis").value, 10);
	gCardsPerSuit = parseInt(document.getElementById("input_number_cartes").value, 10);
	replay();
});

document.getElementById("submit_trier").addEventListener("click", function(event) {
	sortCarpet();
});


document.getElementById("submit_faire_jouer_IA").addEventListener("click", function(event) {
	makeAIPlay();
});

replay();

// --------------------------
// Now for the fun part : make AI play !

const GENIUS_PLACE_DECK = 1;
const GENIUS_PLACE_GONE = 2;
const GENIUS_PLACE_DISCARD = 3;
const GENIUS_PLACE_CARPET = 4;

function initGenius() {
	gGenius.eachCard = [];
	gGenius.nextNotOnCarpetCard = [];
	gGenius.indexCardOnCarpet = [];
	for (var su = 0 ; su < gNumberSuits ; su++) {
		gGenius.nextNotOnCarpetCard.push(-1); 
		gGenius.indexCardOnCarpet.push([-1]);
		gGenius.eachCard.push([-1]); // Dummy card, such that gGenius[0][1] is the card labelled 1 of colour 0.
		for (var nb = 0 ; nb <= gCardsPerSuit ; nb++) {
			gGenius.eachCard[su].push(GENIUS_PLACE_DECK); 
			gGenius.indexCardOnCarpet[su].push(-1);
		}
	}
}

// Update the status of all the cards
function updateStatusCardsForGenius() {
	moreInDiscard = (gDiscard.length > gDeck.length);
	var su, nb;
	for (su = 0 ; su < gNumberSuits ; su++) {
		for (nb = 1 ; nb <= gStacks[su] ; nb++) {
			gGenius.eachCard[su][nb] = GENIUS_PLACE_GONE;
		}
		for (nb = gStacks[su]+1 ; nb < gCardsPerSuit ; nb++) {
			gGenius.eachCard[su][nb] = (moreInDiscard ? GENIUS_PLACE_DISCARD : GENIUS_PLACE_DECK);
		}
	}
	if (!moreInDiscard) {
		for (var c = 0 ; c < gDiscard.length ; c++) {
			if (gDiscard[c] != -1) {
				nb = getNumber(gDiscard[c]);
				su = getColour(gDiscard[c]);
				gGenius.eachCard[su][nb] = GENIUS_PLACE_DISCARD;			
			}
		} 
	} else {
		for (var c = 0 ; c < gDeck.length ; c++) {
			if (gDeck[c] != -1) {
				nb = getNumber(gDeck[c]);
				su = getColour(gDeck[c]);
				gGenius.eachCard[su][nb] = GENIUS_PLACE_DECK;			
			}
		} 	
	}
	for (var c = 0 ; c < gCarpet.length ; c++) {
		if (gCarpet[c] != -1) {
			nb = getNumber(gCarpet[c]);
			su = getColour(gCarpet[c]);
			gGenius.eachCard[su][nb] = GENIUS_PLACE_CARPET;
			gGenius.indexCardOnCarpet[su][nb] = c;
		}
	}
}

// Update the number of ready cards and the next cards "not of carpet". To be called when the statuses of cards are clear.
function updateFutureCardsForGenius() {
	gGenius.readyCards = 0;
	for (su = 0 ; su < gNumberSuits ; su++) {
		gGenius.nextNotOnCarpetCard[su] = gStacks[su]+1;
		while (
				gGenius.nextNotOnCarpetCard[su] <= gCardsPerSuit && 
				gGenius.eachCard[su][gGenius.nextNotOnCarpetCard[su]] == GENIUS_PLACE_CARPET
			) {
			gGenius.nextNotOnCarpetCard[su]++;
		}
		gGenius.readyCards += (gGenius.nextNotOnCarpetCard[su]-gStacks[su]-1);
	}
}

initGenius();

// Note : Remember,
function playOnePlayableCard() {
	var nb;
	if (playFromDiscard()) {
		return true;
	}
	for (var su = 0 ; su < gNumberSuits ; su++) {
		nb = gStacks[su]+1; // First card to play in a suit
		if (nb <= gCardsPerSuit && gGenius.eachCard[su][nb] == GENIUS_PLACE_CARPET) {
			playFromCarpet(gGenius.indexCardOnCarpet[su][nb]);
			return true;
		}
	}
	return false;
}

// Look at the cards. Either play a card (or more !) from the deck, or draw.
function takeADecision() {
	var c = gDiscard[gDiscard.length-1];
	var su = getColour(c);
	var nb = getNumber(c);
	
	// Strategy 1 : Calculate an arbitrary score in each colour.	
		
	
	
	
}
