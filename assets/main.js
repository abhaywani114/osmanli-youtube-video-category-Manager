function selectView(v) {
	document.getElementById("dashboard--auth").style.display = (v == 'auth' ? '':'none');
	document.getElementById("dashboard--main").style.display = (v == 'main' ? '':'none');
	document.getElementById("dashboard--progress").style.display = (v == 'progress'? '':'none');
}
selectView('auth');

gapi.load("client:auth2", function() {
	gapi.auth2.init({
		client_id: "384940529955-beh379sk7u8g0plbqv7njpdfcj7rm87g.apps.googleusercontent.com"
	});
});
		
function authenticate() {
	const auth_status = document.getElementById("auth--status")
	auth_status.innerHTML = '';

	return gapi.auth2.getAuthInstance().signIn({
			scope: "https://www.googleapis.com/auth/youtube.force-ssl"
		}).then(function() { 
			console.log("Sign-in successful");
			auth_status.append(createSpan("Sign-in successful", "green"));
			loadClient(); 

			setTimeout( () => selectView('main'), 1700);

		}, function(err) { 
			console.error("Error signing in", err); 
			auth_status.append(createSpan("Error signing in", "red"));
		});
}

function loadClient() {
	gapi.client.setApiKey("AIzaSyCxQFmiQK8ktCQajO-uNCl-rWOfMos6OgY");
	return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
		.then(function() { 
			console.log("GAPI client loaded for API"); 
			loadCategories();
		},function(err) { 
			console.error("Error loading GAPI client for API", err); 
		});
}

function loadCategories() {
	const categorySelector = document.getElementById("select--cat");
	gapi.client.youtube.videoCategories.list({
		  "regionCode": "IN"//"US"
		}).then(function(response) {
                // Handle the results here (response.result has the parsed body).
                response.result['items'].map((cat) => {
					if (cat.snippet.assignable == true ) {
						const new_element = document.createElement("option");
						new_element.innerText = `${cat.snippet.title} (${cat.id})`;
						new_element.value = cat.id;
						new_element.className = 'option--cat';
						categorySelector.append(new_element);
					}
				});

				progressText.append(createSpan(`Success: Categories loaded from YouTube Server`, 'green'));
              },function(err) { 
				console.error("Execute error", err); 
				progressText.append(createSpan(`Faliure: Unable to load categories from YouTube Server`, 'red'));
		});
}
//////////////////////////////
var videoDetails = [];
var progressText = document.getElementById('progress--text');

function updateCategoryId(res, pcount) {
	 return gapi.client.youtube.videos.update({
	   "part": [
		 "snippet"
	   ],
	   "resource": res 
	 }).then(function(response) {
		 // Handle the results here (response.result has the parsed body).
		progressText.append(createSpan(`Updated: ${res.snippet.title}`, 'green'));
		if(updateProgression(videoDetails.length) == "100.00") {
			progressText.append(createSpan(`Processed: ${videoDetails.length} videos`, 'green'));
		} 
     }, function(err) { 
		console.error("Execute error", err.result.error.message); 

		progressText.append(createSpan(`Error: ${err.result.error.message.replace(/<[^>]*>/g, '')} `, 'red'));
	});
}

async function getVideoDetail(youtube_video_id) {
	 gapi.client.youtube.videos.list({'resource':{
		 id: youtube_video_id,
		 part:'snippet'
	 }}).then(function(response) {
		// Handle the results here (response.result has the parsed body).
		console.log("Response", response);

		response.result["items"].forEach((v) => {
				videoDetails.push({
					id:v.id,
					snippet: {
						title:v.snippet.title,
						categoryId: document.getElementById("select--cat").value
					}
				});
				progressText.append(createSpan(`Found: ${v.snippet.title} (category id: ${v.snippet.categoryId})`, 'green'));
				updateProgression(response.result["items"].length);
		});

		progressText.append(createSpan(`---Update started---`, 'red'));

		select_category = document.getElementById("select--cat")
		select_category = select_category.options[select_category.selectedIndex].text;
		progressText.append(createSpan(`New category: ${select_category} `, 'green'));
		
		videoDetails.forEach( v => {
			updateCategoryId(v);
		});	

	   },function(err) { 
		console.error("Execute error", err); 
		progressText.append(createSpan(`Error: ${err.result.error.message.replace(/<[^>]*>/g, '')} `, 'red'));
	});
 }

function triggerUpdate() {
	const selectedCategoryId = document.getElementById("select--cat").value
	if (selectedCategoryId == '') {
		alert("Please select a category");
		return;
	}


	let youtubeURLs =  document.getElementById("url--textarea").value
	if (youtubeURLs == '') {
		alert("Please enter some YouTube video URLs.");
		return;
	}
	
	//parsing url
	youtubeURLs = youtubeURLs.replace(/,|\n/g, ' ' ).split(" ").filter( e => e != '');
	youtubeURLs = youtubeURLs.map( u => {
		const parse_url = new URL(u);
		return parse_url.searchParams.get('v');
	}).filter(u => u != '' && u != null);

	selectView('progress');
	getVideoDetail(youtubeURLs);
}

function createSpan(text, className) {
	const span = document.createElement("span")
	span.innerText = text;
	span.className = className;
	return span;
}

function updateProgression(v_count) {
	width = Number(document.getElementById("progress-bar--percentage").innerText.replace("%",''));
	let	percentage = ((((width * v_count*2)/100)+1) /(v_count*2)) * 100;

	document.getElementById("progress-bar--status").style.width = `${percentage}%`;

	document.getElementById("progress-bar--percentage").innerHTML = `${percentage.toFixed(2)}%`;
	return percentage.toFixed(2);
}

function newBatch() {
	selectView('main');
	videoDetails = [];
	document.getElementById("url--textarea").value = '';
	document.getElementById("select--cat").selectedIndex = 0;
	progressText.innerHTML = '';
	progressText.append(createSpan("New batch started", 'green'));
	document.getElementById("progress-bar--status").style.width = `${0.5}%`;
	document.getElementById("progress-bar--percentage").innerHTML = `${0}%`;
}
