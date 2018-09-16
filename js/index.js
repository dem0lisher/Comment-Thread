(function(){

	load();

	function load(){
		getData('GET', 'posts?_embed=comments', null, function(data){
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
        if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 201)) {
          if (callback) {
            callback(xhr);
          }
        }
        else if (xhr.readyState === 4 && xhr.status === 0) {
          if (callback) {
            callback(404);
          }
        }
      }
    })(xhr, callback);
	}

	function getData(type, url, data, callback){
		ajaxRequest(type, url, data, function(xhr) {
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
      getData('POST', 'posts', data, function(postData){
        var post = getPostTemplate(postData);
        var div = document.createElement('div');
        div.innerHTML = post;
        var postsContainer = document.getElementById('posts-container');
        postsContainer.appendChild(div);
        document.getElementById('new-post-status').value = '';
        document.getElementById('new-post-username').value = '';
        bindActionEvents();
      });
    }
  }

  function openCommentForm(e){
    var commentForm = document.getElementById('new-comment-form-'+e.currentTarget.dataset.id);
    commentForm.classList.remove('hidden');
  }

  function submitComment(e){
    var newCommentStatus = document.getElementById('new-comment-status-'+this.dataset.id).value;
    var newCommentUsername = document.getElementById('new-comment-username-'+this.dataset.id).value;
    if(newCommentStatus && newCommentUsername){
      var data = {name: newCommentUsername, profileImage: 'user.jpg', text: newCommentStatus, votes: 0, createdAt: new Date().toLocaleString(), level: parseInt(this.dataset.level)+1, postId: this.dataset.postid, parentId: this.dataset.id, hasChild: false, childId: ""};
      getData('POST', 'comments', data, function(commentData){
        var comment = getCommentTemplate(commentData);
        var div = document.createElement('div');
        div.innerHTML = comment;
        if(commentData.level === 1){
          var postDetails = document.getElementById('post-details-'+commentData.parentId);
          postDetails.appendChild(div);
        }
        else{
          var commentDetails = document.getElementById('comment-details-'+commentData.parentId);
          commentDetails.appendChild(div);
        }
        document.getElementById('new-comment-status-'+commentData.parentId).value = '';
        document.getElementById('new-comment-username-'+commentData.parentId).value = '';
        document.getElementById('new-comment-form-'+commentData.parentId).classList.add('hidden');
        getData('PATCH', 'comments/'+commentData.parentId, {hasChild: true, childId: commentData.id});
        bindActionEvents();
      });
    }
  }

  function castVote(e){
    var data, url;
    if(this.classList.contains('arrow-up')){
      data = {votes: parseInt(document.getElementById('net-votes-'+this.dataset.id).innerHTML) + 1};
    }
    else{
      data = {votes: parseInt(document.getElementById('net-votes-'+this.dataset.id).innerHTML) - 1};
    }
    if(this.parentNode.parentNode.classList.contains('post-details')){
      url = 'posts/'+this.dataset.id;
    }
    else{
      url = 'comments/'+this.dataset.id;
    }
    getData('PATCH', url, data, function(updatedData){
      var netVotes = document.getElementById('net-votes-'+updatedData.id);
      netVotes.innerHTML = updatedData.votes;
      if(updatedData.votes > 0){
        netVotes.classList.remove('negative-votes');
        netVotes.classList.add('positive-votes');
      }
      else{
        netVotes.classList.remove('positive-votes');
        netVotes.classList.add('negative-votes');
      }
    });
  }

  function populatePosts(postsData){
    var posts = '', comments = '';
    for(var i=0;i<postsData.length;i++){
      comments = '';
      if(postsData[i].comments && postsData[i].comments.length){
        comments = populateComments(postsData[i]);
      }
      posts += getPostTemplate(postsData[i], comments);
    }
    var postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = posts;
    bindActionEvents();
  }

  function getPostTemplate(postData, comments){
    var voteColor;
    if(postData.votes > 0){
      voteColor = 'positive-votes';
    }
    else{
      voteColor = 'negative-votes';
    }
    var post = `<div class="post flex-row" id="post-` + postData.id + `">
                  <div>
                    <img src="./img/` + postData.profileImage + `" class="profile-img" alt="Profile Image">
                  </div>
                  <div class="flex-column post-details" id="post-details-` + postData.id + `">
                    <div class="author-name">`
                      + postData.name +
                    `</div>
                    <div class="content">`
                      + postData.text +
                    `</div>
                    <div class="flex-row flex-valign">
                      <div class="arrow arrow-up" data-id="` + postData.id + `"></div>
                      <div class="arrow arrow-down" data-id="` + postData.id + `"></div>
                      <div class="net-votes ` + voteColor + `" id="net-votes-` + postData.id + `" data-id="` + postData.id + `">` + postData.votes + `</div>
                      <a href="javascript: void(0)" class="reply-btn" data-id="` + postData.id + `">
                        Reply
                      </a>
                      <a href="javascript: void(0)" class="share-btn">
                        Share
                      </a>
                    </div>
                    <form class="new-comment-form hidden" id="new-comment-form-` + postData.id + `">
                      <textarea name="status" class="new-comment-status" id="new-comment-status-` + postData.id + `" rows="2" placeholder="comment"></textarea>
                      <div class="flex-row">
                        <input type="text" class="new-comment-username" id="new-comment-username-` + postData.id + `" name="username" placeholder="username" />
                        <button type="button" class="new-comment-btn" id="new-comment-btn-` + postData.id + `" data-id="` + postData.id + `" data-level=0>Comment</button>
                      </div>
                    </form>`
                    + (comments ? comments : '') +
                  `</div>
                </div>`;
    return post;
  }

  function populateComments(postData){
    var comments = '';
    for(var i=0;i<postData.comments.length;i++){
      if(postData.comments[i].level === 1){
        comments += getCommentThread(postData.comments[i], postData);
      }
    }
    return comments;
  }

  function getCommentThread(commentData, postData){
    if(commentData.hasChild){
      for(var i=0;i<postData.comments.length;i++){
        if(commentData.childId === postData.comments[i].id){
          var childComments = getCommentThread(postData.comments[i], postData);
          break;
        }
      }
    }
    var commentThread = getCommentTemplate(commentData, childComments);
    return commentThread;
  }

  function getCommentTemplate(commentData, childComments){
    var voteColor;
    if(commentData.votes > 0){
      voteColor = 'positive-votes';
    }
    else{
      voteColor = 'negative-votes';
    }
    var comment = `<div class="comment flex-row" id="comment-` + commentData.id + `">
                      <div>
                        <img src="./img/` + commentData.profileImage + `" class="profile-img" alt="Profile Image">
                      </div>
                      <div class="flex-column comment-details" id="comment-details-` + commentData.id + `">
                        <div class="author-name">`
                          + commentData.name +
                        `</div>
                        <div class="content">`
                          + commentData.text +
                        `</div>
                        <div class="flex-row flex-valign">
                          <div class="arrow arrow-up" data-id="` + commentData.id + `"></div>
                          <div class="arrow arrow-down" data-id="` + commentData.id + `"></div>
                          <div class="net-votes ` + voteColor + `" id="net-votes-` + commentData.id + `" data-id="` + commentData.id + `">` + commentData.votes + `</div>
                          <a href="javascript: void(0)" class="reply-btn" data-id="` + commentData.id + `">
                            Reply
                          </a>
                          <a href="javascript: void(0)" class="share-btn">
                            Share
                          </a>
                        </div>
                        <form class="new-comment-form hidden" id="new-comment-form-` + commentData.id + `">
                          <textarea name="status" class="new-comment-status" id="new-comment-status-` + commentData.id + `" rows="2" placeholder="comment"></textarea>
                          <div class="flex-row">
                            <input type="text" class="new-comment-username" id="new-comment-username-` + commentData.id + `" name="username" placeholder="username" />
                            <button type="button" class="new-comment-btn" id="new-comment-btn-` + commentData.id + `" data-id="` + commentData.id + `" data-level="` + commentData.level + `" data-postid="` + commentData.postId + `">Comment</button>
                          </div>
                        </form>`
                        + (childComments ? childComments : '') +
                      `</div>
                    </div>`;
    return comment;
  }

  function bindActionEvents(){
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

})();