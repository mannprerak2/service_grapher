set -e

npm run build
rm -rf docs
cp -R dist docs
