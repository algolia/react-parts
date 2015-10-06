# React parts

# Download data

Il y a des npm run truc à lancer pour chopper les données, la parser, puis
mettre à jour les components

# Docker

Fill the `keys.json` with your credentials (only Algolia credentials are used
for serving the website).

Build the images
`docker build -t reactparts/reactparts .`

Run the server
`docker run -p 49160:8080 reactparts/reactparts`

Website accessible on http://localhost:8080/


