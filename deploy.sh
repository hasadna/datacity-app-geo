#!/bin/sh
git checkout master && \
(git branch -D dist || true) && \
git checkout -b dist && \
rm .gitignore && \
ng build --prod -c production && \
cp CNAME dist/datacity-app-geo/ && \
git add dist/datacity-app-geo && \
git commit -m dist && \
(git branch -D gh-pages || true) && \
git subtree split --prefix dist/datacity-app-geo -b gh-pages && \
git push -f origin gh-pages:gh-pages && \
git checkout master && \
git branch -D gh-pages && \
git branch -D dist && \
git checkout . && \
git push
