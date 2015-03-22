## Express Starter Kit

### Turning the internet's feeds into digestible, bite-sized chunks of awesomeness.
### RSS redesigned for the 21st century.

- Make sure to run export ```NODE_PATH=./config:./app/controllers```

### Defaults
- Node/Express MVC Architecture
- MongoDB
- Gulp
- Bower
- SASS
- React
- Livereload

## Requirements

* [NodeJs](http://nodejs.org)
* [mongodb](http://mongodb.org)
* [imagemagick](http://www.imagemagick.org/script/index.php)

## Install

```sh
$ git clone git://github.com/madhums/node-express-mongoose-demo.git
$ npm install
```

**NOTE:** Do not forget to set the facebook, twitter, google, linkedin and github `CLIENT_ID`s and `SECRET`s. In `development` env, you can simply copy
`config/env/env.example.json` to `config/env/env.json` and just replace the
values there. In production, it is not safe to keep the ids and secrets in
a file, so you need to set it up via commandline. If you are using heroku
checkout how environment variables are set [here](https://devcenter.heroku.com/articles/config-vars).

If you want to use image uploads, don't forget to set env variables for the
imager config.

```sh
$ export IMAGER_S3_KEY=AWS_S3_KEY
$ export IMAGER_S3_SECRET=AWS_S3_SECRET
$ export IMAGER_S3_BUCKET=AWS_S3_BUCKET
```

then

```sh
$ npm start
```

(Note: When you do npm start, `NODE_PATH` variable is set from package.json start script. If you are doing `node server.js`, you need to make sure to set this)

Then visit [http://localhost:3000/](http://localhost:3000/)

## Tests

```sh
$ npm test
```
