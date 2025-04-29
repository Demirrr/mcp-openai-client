README.md





npm install -g typescript
npm init -y # initialize a package.json
npm install typescript --save-dev # install typeScript
npx tsc --init
npx tsc && node index.js

After adding
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js"
}


npm run build && npm start



npm install -g pkg

pkg dist/index.js --targets node18-linux-x64 --output llm-cli

./llm-cli

