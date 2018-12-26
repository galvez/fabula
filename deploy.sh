yarn build:docs
mv docs/.vuepress/dist/* docs/
rm -rf docs/.vuepress/dist/
git add docs
git commit -m "docs: build update"
