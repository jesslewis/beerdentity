// Model

var model = {
	loggedIn: false,
	user: undefined,
	beers: {
	}
}

// View

var loginTemplate;
var beerInputTemplate;
var beerdentityTemplate;

function compileTemplates() {
	var templateSource = $('#login-template').html();
	loginTemplate = Handlebars.compile(templateSource);

	var beerTemplateSource = $('#beerInput-template').html();
	beerInputTemplate = Handlebars.compile(beerTemplateSource);

  var beerdentityTemplateSource = $('#beerdentity-template').html();
  beerdentityTemplate = Handlebars.compile(beerdentityTemplateSource);

}

function renderLogin() {
	var loginHtml = loginTemplate(model);
	$('#initSignIn').html(loginHtml);
}

function renderBeer() {
	var beerHtml = beerInputTemplate(model);
	$('#pastBeers').html(beerHtml);
}

function renderBeerdentity() {
  var dentityHtml = beerdentityTemplate(model);
  $('#beerdentity').html(dentityHtml);
}

// Controller

function setup() {
  compileTemplates();
  renderLogin();
  renderBeer();
  renderBeerdentity();

  // TODO: Event Listeners
  $('#initSignIn').on('click', '#signUp', handleSignUp);
  $('#initSignIn').on('click', '#signIn', handleSignIn);
  $('#initSignIn').on('click', '#signOut', handleSignOut);
  firebase.auth().onAuthStateChanged(handleAuthStateChange); // logged in or not changes it runs this

  //database stuff
  $('#initSignIn').on('click', '#confirm', handleBeerInput);
}

function handleSignOut() {
  	firebase.auth().signOut();
}

function handleSignUp() {
  	var email = $('input[name="email"]').val();
  	var password = $('input[name="password"]').val();

  firebase.auth().createUserWithEmailAndPassword(email, password);
}

function handleSignIn() {
  var email = $('input[name="email"]').val();
  var password = $('input[name="password"]').val();

  firebase.auth().signInWithEmailAndPassword(email, password);
}

function handleBeerInput() {
	var beersInput = {
		author: model.user.email,
		brewery: $('input[name="brewery"]').val(),
		beer: $('input[name="beer"]').val(),
		beerType: $('#beerType').val(),
		rating: $('#rating').val()
	}

  var refURL = "/beersDB/" + model.user.uid;
  firebase.database().ref(refURL).push(beersInput);
}

function processBeers(snapshot) {
	var beers = snapshot.val();
  model.beers = beers;
  model.frequentBeer = findMostFrequentBeer(beers);
  console.log(model.frequentBeer);
  renderBeer();
  renderBeerdentity();
}

function findMostFrequentBeer(beers) {
  
	var beerKeys = Object.keys(beers); // this is an array
  var beerFrequency = {}; // object
  var highestFrequency = 0;
  var highestFrequencyBeerType;
  for (var i = 0; i < beerKeys.length; i++) {
      var key = beerKeys[i];
      var beerType = beers[key].beerType;
      if (beerFrequency[beerType]) {
        beerFrequency[beerType] += 1;
      } else {
        beerFrequency[beerType] = 1;
      }
  }
  var newBeerFrequency = Object.keys(beerFrequency);
  for (var j = 0; j < newBeerFrequency.length; j++) {
      var key = newBeerFrequency[j];
      var frequency = beerFrequency[key];
      if (frequency > highestFrequency) {
        var highestFrequency = frequency;
        var highestFrequencyBeerType = key;
      }
  }

	return highestFrequencyBeerType;
  
}

function handleAuthStateChange() {
  var user = firebase.auth().currentUser; // get current user if defined / not logged in undefined

  if (user) { // object truthy . user just logged in, add access to comments
    model.loggedIn = true;
    model.user = user;
    var refURL = "/beersDB/" + model.user.uid;
    firebase.database().ref(refURL).on('value', processBeers); // add acess to comments event listner
  } else {
    model.loggedIn = false;
    model.user = undefined; // falsey
  }

  // make updates rerender our templates
  
  renderLogin();
  renderBeer();
  renderBeerdentity();
}

$(document).ready(setup);
