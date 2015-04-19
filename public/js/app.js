$(document).ready(function () {

  $('#tags').tagsInput({
    'height':'60px',
    'width':'280px'
  });

  $('.subscribe').on('click', function(e) {
    e.preventDefault();
    var link = $(this);
    var feedID = $(this).data('feed-id');
    var subscriptionData = {
      // user: "550daf18a4050bb275cb31f9",
      feed: feedID
    };
    $.post( "/subscriptions", subscriptionData, function( data ) {
      console.log(data);
      link.text("Subscribed");
    });
  });

//   $.ajax({
//     url: '/script.cgi',
//     type: 'DELETE',
//     success: function(result) {
//         // Do something with the result
//     }
// });

});
