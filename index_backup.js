<html>
	<head>
		<title>Youtube Playlist Generator</title>
		<script src="https://apis.google.com/js/api.js"></script>
	</head>
	<body>
			<button onclick="authenticate()">Authenticate Session</button>
			<br/>
			<br/>
			<input placeholder="Video ID" id='v-id'/>
			<button onclick="getVideoDetail()">Fetch Video Data</button>
			<p>Video Title: <span id="video-title"></span></p>
			<p>Video Category Id: <span id="video-cat"></span></p>
			<input placeholder="New Category Id" id="v-cid" />
			<button onclick="updateCategoryId()">Update</button>
	</body>

	<script>
	  function authenticate() {
			return gapi.auth2.getAuthInstance()
				.signIn({scope: "https://www.googleapis.com/auth/youtube.force-ssl"})
				.then(function() { console.log("Sign-in successful");loadClient(); },
				  function(err) { console.error("Error signing in", err); });
	  }

	  function loadClient() {
		gapi.client.setApiKey("AIzaSyDvJD5zHmTSW6XDIC3RVz83YDK-DEMSur4");
			return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
			.then(function() { console.log("GAPI client loaded for API"); },
				  function(err) { console.error("Error loading GAPI client for API", err); });
		  }

	  gapi.load("client:auth2", function() {
		gapi.auth2.init({client_id: "384940529955-dohqi8t2hg6gdf9gspvj6q858khq0gaf.apps.googleusercontent.com"});
	  });		
/////////////////////////////////////////////////////////////


	  // Make sure the client is loaded and sign-in is complete before calling this method.
	  function updateCategoryId() {
		return gapi.client.youtube.videos.update({
		  "part": [
			"snippet"
		  ],
		  "resource": {
			id: document.getElementById('v-id').value, //'cDSa2Fgbi_E',
			"snippet": {
				"title": document.getElementById('video-title').innerHTML, 
			  "categoryId": document.getElementById('v-cid').value,
			}
		  }
		})
		.then(function(response) {
			// Handle the results here (response.result has the parsed body).
			console.log("Response", response);
				alert("Done");
		  },
		  function(err) { console.error("Execute error", err); });
	  }

	function getVideoDetail() {
		 return gapi.client.youtube.videos.list({'resource':{
				id: document.getElementById('v-id').value, //'cDSa2Fgbi_E',
				part:'snippet'
			}})
			.then(function(response) {
                // Handle the results here (response.result has the parsed body).
                console.log("Response", response);
				document.getElementById('video-title').innerHTML = response.result["items"][0].snippet.title
				document.getElementById('video-cat').innerHTML = response.result["items"][0].snippet.categoryId
              },
              function(err) { console.error("Execute error", err); });
	}

	</script>
</html>	
