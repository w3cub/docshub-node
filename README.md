# docshub-node

>node Server-Side Rendering version docshub.

## Quick Start

As you know The DevDocs project has two pieces.

>DevDocs is made of two pieces: a Ruby scraper that generates the documentation and metadata, and a JavaScript app powered by a small Sinatra app.

Current project just replace the Sinatra app part, so you still need to install devdocs project.


1、setup devdocs, firstly

```sh

  # donwload file https://github.com/Thibaut/devdocs
  git clone https://github.com/Thibaut/devdocs.git && cd devdocs
  gem install bundler
  bundle install
  # default html css dom ...
  bundle exec thor docs:download --default
  # download all docs
  # bundle exec thor docs:download --all

```

2、install current project
```sh
  git@github.com:icai/docshub-node.git
  npm install

```
modify the `docshub-node/config.js` file

setup the devdocs project relative path, as follows:
```
  docs: {
    path: '../devdocs/public/docs/docs.json',
    dir: '../devdocs/public/docs/'
  },
```

Then finially boostrap the project

```sh

npm run dev

```

## Todo
- [x] cache render
- [ ] database manage
- [ ] user center
- [ ] read count
- [ ] ...


## Related project

https://github.com/icai/docshub

https://github.com/Thibaut/devdocs

https://github.com/nodeca/mincer


## License

Copyright (c) Terry Cai. Licensed under the MIT license.