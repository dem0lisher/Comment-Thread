(function(){

	load();

	function load(){
		getData('posts?_embed=comments', null, function(data){
      populatePosts(data);
		});
    var newPostBtn = document.getElementById('new-post-btn');
    newPostBtn.addEventListener('click', submitPost);
	}

	function initRequest(){
		var xhr;
    if(window.XMLHttpRequest){
      xhr = new XMLHttpRequest();
    }
    else{
     	xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xhr;
	}

	function ajaxRequest(type, url, data, callback){
		var xhr = (typeof xhr === 'undefined') ? initRequest() : xhr;
    var url = "http://localhost:3000/" + url;
    xhr.open(type, url, true);
    xhr.setRequestHeader("Content-Type", 'application/json');
    data = JSON.stringify(data);
    xhr.send(data);
    xhr.onreadystatechange = (function(xhr, callback) {
      return function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
          if (callback) {
            callback(xhr);
          }
        }
        else if (xhr.readyState == 4 && xhr.status == 0) {
          if (callback) {
            callback(404);
          }
        }
      }
    })(xhr, callback);
	}

	function getData(url, data, callback){
		ajaxRequest("GET", url, data, function(xhr) {
      if (xhr == 404) {
        callback(null);
      }
      else {
        required_data = JSON.parse(xhr.responseText);
        callback(required_data);
      }
	  });
	}

  function postData(url, data, callback){
    ajaxRequest("POST", url, data, function(xhr) {
      if (xhr == 404) {
        callback(null);
      }
      else {
        required_data = JSON.parse(xhr.responseText);
        callback(required_data);
      }
    });
  }

  function submitPost(){
    var newPostStatus = document.getElementById('new-post-status').value;
    var newPostUsername = document.getElementById('new-post-username').value;
    if(newPostStatus && newPostUsername){
      var data = {name: newPostUsername, profileImage: 'user.jpg', text: newPostStatus, votes: 0, createdAt: new Date().toLocaleString()};
      postData('posts', data, function(postData){
        debugger;
      });
    }
  }

  function openCommentForm(e){
    var commentForm = document.getElementById('new-comment-form-'+e.currentTarget.dataset.id);
    commentForm.classList.remove('hidden');
  }

  function submitComment(e){
    var newCommentStatus = document.getElementById('new-comment-status-'+e.currentTarget.dataset.id).value;
    var newCommentUsername = document.getElementById('new-comment-username-'+e.currentTarget.dataset.id).value;
    if(newCommentStatus && newCommentUsername){
      var data = {name: newCommentUsername, profileImage: 'user.jpg', text: newCommentStatus, createdAt: new Date().toLocaleString(), postId: e.currentTarget.dataset.id};
      postData('comments', data, function(commentData){
        debugger;
      });
    }
  }

  function castVote(){
    debugger;
    if(this.classList.contains('arrow-up')){
      var data = {id: this.dataset.id, votes: 1};
      postData('update-vote', data, function(postsData){
        debugger;
      });
    }
    else{

    }
  }

  function populatePosts(postsData){
    var posts = '', comments = '';
    for(var i=0;i<postsData.length;i++){
      comments = '';
      if(postsData[i].comments && postsData[i].comments.length){
        comments = populateComments(postsData[i]);
      }
      posts += `<div class="post flex-row" id="post-` + postsData[i].id + `">
                  <div>
                    <img src="./img/` + postsData[i].profileImage + `" class="profile-img" alt="Profile Image">
                  </div>
                  <div class="flex-column post-details">
                    <div class="author-name">`
                      + postsData[i].name +
                    `</div>
                    <div>`
                      + postsData[i].text +
                    `</div>
                    <div class="flex-row flex-valign">
                      <div class="arrow arrow-up" data-id="` + postsData[i].id + `"></div>
                      <div class="arrow arrow-down" data-id="` + postsData[i].id + `"></div>
                      <div class="net-votes" id="net-votes-"` + postsData[i].id + `>` + postsData[i].votes + `</div>
                      <a href="javascript: void(0)" class="reply-btn" data-id="` + postsData[i].id + `">
                        Reply
                      </a>
                      <a href="javascript: void(0)" class="share-btn">
                        Share
                      </a>
                    </div>
                    <form class="new-comment-form hidden" id="new-comment-form-` + postsData[i].id + `">
                      <textarea name="status" class="new-comment-status" id="new-comment-status-` + postsData[i].id + `" rows="2" placeholder="comment"></textarea>
                      <div class="flex-row">
                        <input type="text" class="new-comment-username" id="new-comment-username-` + postsData[i].id + `" name="username" placeholder="username" />
                        <button type="button" class="new-comment-btn" id="new-comment-btn-` + postsData[i].id + `" data-id="` + postsData[i].id + `">Comment</button>
                      </div>
                    </form>`
                    + comments +
                  `</div>
                </div>`;
    }
    var postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = posts;
    var replyBtn = document.getElementsByClassName('reply-btn');
    for(var i=0;i<replyBtn.length;i++){
      replyBtn[i].addEventListener('click', openCommentForm);
    }
    var commentBtn = document.getElementsByClassName('new-comment-btn');
    for(i=0;i<commentBtn.length;i++){
      commentBtn[i].addEventListener('click', submitComment);
    }
    var voteBtn = document.getElementsByClassName('arrow');
    for(i=0;i<voteBtn.length;i++){
      voteBtn[i].addEventListener('click', castVote);
    }
  }

  function populateComments(commentsData){
    debugger;
    var comments = '';
    for(var i=0;i<commentsData.comments.length;i++){
      if(commentsData.comments[i].level === 1){
        while(commentsData.comments[i].hasChild){
          
        }
      }
    }
  }

})();