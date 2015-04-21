/**
 * Reddit API wrapper for the browser (https://git.io/Mw39VQ)
 * @author Sahil Muthoo <sahil.muthoo@gmail.com> (https://www.sahilm.com)
 * @license MIT
 */
 (function (window) {
  "use strict";
  var reddit = window.reddit = {};

  reddit.hot = function (subreddit) {
    return listing({
      subreddit: subreddit,
      resource: "hot"
    });
  };

  reddit.top = function (subreddit) {
    return listing({
      subreddit: subreddit,
      resource: "top"
    }, ["t"]);
  };

  reddit.controversial = function (subreddit) {
    return listing({
      subreddit: subreddit,
      resource: "controversial"
    }, ["t"]);
  };

  reddit["new"] = function (subreddit) {
    return listing({
      subreddit: subreddit,
      resource: "new"
    });
  };

  reddit.about = function (subreddit) {
    return fetch({
      subreddit: subreddit,
      resource: "about"
    });
  };

  reddit.random = function (subreddit) {
    return fetch({
      subreddit: subreddit,
      resource: "random"
    });
  };

  reddit.info = function (subreddit) {
    var on = {
      subreddit: subreddit,
      resource: "api/info"
    };
    return withFilters(on, ["id", "limit", "url"]);
  };

  reddit.comments = function (article, subreddit) {
    var on = {
      subreddit: subreddit,
      resource: "comments/" + article
    };
    return withFilters(on, ["comment", "context", "depth", "limit", "sort"]);
  };

  reddit.recommendedSubreddits = function (srnames) {
    var on = {
      resource: "api/recommend/sr/" + srnames
    };
    return withFilters(on, ["omit"]);
  };

  reddit.subredditsByTopic = function (query) {
    var on = {
      resource: "api/subreddits_by_topic",
      params: {
        query: query
      }
    };
    return fetch(on);
  };

  reddit.search = function (query, subreddit) {
    var on = {
      subreddit: subreddit,
      resource: "search",
      params: {
        q: query
      }
    };
    return withFilters(on, ["after", "before", "count", "limit", "restrict_sr", "show", "sort", "syntax", "t"]);
  };

  reddit.searchSubreddits = function (query) {
    return listing({
      resource: "subreddits/search",
      params: {
        q: query
      }
    });
  };

  reddit.popularSubreddits = function () {
    return listing({
      resource: "subreddits/popular"
    });
  };

  reddit.newSubreddits = function () {
    return listing({
      resource: "subreddits/new"
    });
  };

  reddit.aboutUser = function (username) {
    return fetch({
      resource: "user/" + username + "/about"
    });
  };

  function listing(on, extras) {
    extras = extras || [];
    return withFilters(on, ["after", "before", "count", "limit", "show"].concat(extras));
  }

  function fetch(on) {
    return {
      fetch: function (res, err) {
        getJSON(redditUrl(on), res, err);
      }
    };
  }

  function withFilters(on, filters) {
    var ret = {};
    on.params = on.params || {};
    filters = filters || [];

    var without = function (object, key) {
      var ret = {};
      for (var prop in object) {
        if (object.hasOwnProperty(prop) && prop !== key) {
          ret[prop] = object[prop];
        }
      }
      return ret;
    };

    var filter = function (f) {
      if (f === "show") {
        return function () {
          on.params[f] = "all";
          return without(this, f);
        };
      } else {
        return function (arg) {
          on.params[f] = arg;
          return without(this, f);
        };
      }
    };

    for (var i = 0; i < filters.length; i++) {
      ret[filters[i]] = filter(filters[i]);
    }
    ret.fetch = function (res, err) {
      getJSON(redditUrl(on), res, err);
    };
    return ret;
  }

  function redditUrl(on) {
    var url = "http://www.reddit.com/";
    var keys = function (object) {
      var ret = [];
      for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
          ret.push(prop);
        }
      }
      return ret;
    };

    if (on.subreddit !== undefined) {
      url += "r/" + on.subreddit + "/";
    }
    url += on.resource + ".json";
    if (keys(on.params).length > 0) {
      var qs = [];
      for (var param in on.params) {
        if (on.params.hasOwnProperty(param)) {
          qs.push(encodeURIComponent(param) + "=" +
            encodeURIComponent(on.params[param]));
        }
      }
      url += "?" + qs.join("&");
    }
    return url;
  }

  function getJSON(url, res, err) {
    get(url, function (data) {
      res(JSON.parse(data));
    }, err);
  }

  function get(url, res, err) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      return res(xhr.response);
    };
    xhr.onerror = function () {
      if (err !== undefined) {
        return err(xhr.response);
      }
    };
    xhr.send();
  }
})(window);

$(document).ready(function () {

  $('#tags').tagsInput({
    'height':'60px',
    'width':'280px'
  });

  function searchSubs(term) {
    $(".sub-list").empty();
    reddit.searchSubreddits(term).limit(10).fetch(function(res) {
      $.each(res.data.children, function(index, sub) {
        $('.sub-list').append('<li data-url="' + sub.data["url"] + '">' + '<b>r/' + sub.data["display_name"] + '</b>' + ' (' + sub.data["public_description"] + ') ' + '<a class="subscribe">Subscribe</a>' + '</li>');
      });
    });
  }

  $('.search-subs').keypress(function(e) {
    if(e.which == 13) {
      searchSubs($(this).val());
    }
  });

  $('.glyphicon-search').on('click', function(e) {
    searchSubs($('.search-subs').val());
  });


  $('.sub-list').on('click', 'a', function(e) {
    var link = $(this);
    e.preventDefault();
    console.log(e);
    // Subscribe
    var subscriptionData = {
      url: $(this).parent().data('url')
    }

    $.post( "/subscriptions", subscriptionData, function( data ) {
      console.log(data);
      link.text("Subscribed")
    });
  });

  $('.subscribe, .unsubscribe').on('click', function(e) {
    e.preventDefault();
    var link = $(this);
    var feedID = $(this).data('feed-id');
    var subscriptionData = {
      feed: feedID
    };

    if(link.hasClass('subscribe')) {
      $.post( "/subscriptions", subscriptionData, function( data ) {
        console.log(data);
        console.log("subscribed");
        link.text("Subscribed");
        link.addClass('unsubscribe').removeClass('subscribe');
      });
    } else {
      $.post( "/subscriptions", subscriptionData, function( data ) {
        console.log(data);
        console.log("unsubscribed");
        link.text("Subscribe");
        link.addClass('subscribe').removeClass('unsubscribe');
      });
    }
  });

});
