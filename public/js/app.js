$(document).ready(function () {

  $('#tags').tagsInput({
    'height':'60px',
    'width':'280px'
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
