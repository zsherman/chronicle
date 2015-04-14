- Users enters new source
- We check if that source exists
  - If it does, then we do nothing
  - If it doesn't, we scrape it and store the links
- The email cron run looks through the users's subscriptions, compiles links and emails

Useful Queries:

<!-- Find by id -->
db.getCollection('subscriptions').find({_id: ObjectId("552c86991f70110000de680a")})
<!-- Find by parent id -->
db.getCollection('subscriptions').find({"user": ObjectId("550daf18a4050bb275cb31f9")})

"Follow blogs that don't have RSS feeds." - Using Kimono like tool, hellobar/tumblr follow bar.
